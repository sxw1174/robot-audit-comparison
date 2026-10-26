"""Merge a receipt-bound approved O export into the public comparison snapshot."""
import argparse
import json
from datetime import datetime
from pathlib import Path

from build_dataset import FIELDS, PRIVATE, clean, digest, metric

GROUPS = [
    ("o1compact", "O1 Compact", "#8a6bb8", "persistent-cap20-o1-compact",
     "a914bee7842dceb173378f5813a0cacd00c2a80a696f195588f8259d2bc8f628", 40),
    ("o456", "O456 Clear", "#b06b3f", "persistent-cap20-o456-clear",
     "e74a4b2bdf132b02ebec8150d04102ce8cbc2c883748d9e69ed36064602def1c", 41),
]
NOTE = "O1 Compact与O456 Clear分别收录40/42、41/42项程序校验且当前复核批准的结果；整批最终验收未完成。三项缺失不进入指标、事件或配对统计。"


def public_run(row, gid, profile):
    result = row["result"]
    item = {
        "id": row["run"]["run_id"], "group": gid,
        **{k: row["run"][k] for k in ("task", "variant", "seed", "scene")},
        "audit": "approved", "metrics": {}, "events": [], "coverage": [],
        "videos": [], "summary": clean(result.get("summary")),
        "limitations": [clean(x) for x in result.get("limitations", [])],
        "config": {
            "profile": profile, "effort": "medium", "model": "gpt-6-astra",
            "client_version": "0.153.4", "max_decisions": 100,
            "native_control_cap": 20,
        },
        "source": {
            "analysis_sha256": row["analysis_sha256"],
            "review_fingerprint": row["fingerprint"],
            "assignment_sha256": row["assignment_sha256"],
            "review_batch": row["review_batch"],
            "models": ["gpt-6.1-sol"], "review_effort": "medium",
            "files": [{"kind": name, **entry} for name, entry in row["source_files"].items()],
        },
    }
    for m in result["metrics"]:
        key = FIELDS[int(m["id"][1:]) - 1]
        status = {
            "native": "confirmed", "confirmed": "lower_bound",
            "zero_confirmed": "lower_bound", "lower_bound": "lower_bound",
            "lower_bound_with_candidates": "lower_bound",
            "self_report_confirmed": "self_report", "unavailable": "unknown",
        }.get(m["status"], "unknown")
        item["metrics"][key] = metric(m["value"], status, m.get("reason"), m["status"])
    assert set(item["metrics"]) == set(FIELDS)
    for e in result["events"]:
        item["events"].append({
            "id": clean(e["event_id"]),
            "metrics": [FIELDS[int(c[1:]) - 1] for c in e["metric_ids"]],
            "status": e["status"], "object": clean(e.get("object")),
            "arm": clean(e.get("arm_direction")), "result": clean(e.get("result")),
            "visual": clean(e.get("visual_evidence")),
            "uncertainty": clean(e.get("uncertainty_reason")),
            "time": [e.get("video_start"), e.get("video_end")],
            "decisions": [e.get("decision_start"), e.get("decision_end")],
            "frames": [clean(f, 250) for f in e.get("frame_ids", [])],
        })
    for c in result["coverage"]:
        item["coverage"].append({k: c.get(k) for k in (
            "view", "fps", "frame_count", "duration_seconds", "base_interval",
            "base_complete", "action_review_complete")})
    for v in row["videos"]:
        if (v.get("url") or "").startswith("https://cloud.tsinghua.edu.cn/"):
            item["videos"].append({
                "camera": v.get("camera") or v["path"],
                **{k: v.get(k) for k in ("url", "sha256", "bytes")},
            })
    return item


def merge(data, export, input_sha):
    gids = {g[0] for g in GROUPS}
    data["groups"] = [g for g in data["groups"] if g["id"] not in gids]
    data["runs"] = [r for r in data["runs"] if r["group"] not in gids]
    data["missing"] = [r for r in data.get("missing", []) if r["group"] not in gids]
    data["notes"] = [n for n in data.get("notes", []) if not n.startswith("O1 Compact与O456 Clear")]
    data["inputs"] = [i for i in data.get("inputs", []) if i["name"] != "approved-o-export"]
    for gid, name, color, profile, experiment, expected in GROUPS:
        group = export["groups"][gid]
        assert group["approved"] == group["program_validated"] == len(group["rows"]) == expected
        assert not group["actual_owners"] and not group["batch_complete"]
        description = f"官方首轮42；{expected}项程序校验且当前复核批准。整批最终验收未完成，缺失项不纳入统计。"
        data["groups"].append({
            "id": gid, "name": name, "long_name": f"{profile} · medium · 首轮42",
            "color": color, "effort": "medium", "family": profile,
            "planned": 42, "completed": expected, "needs_attention": 42 - expected,
            "audit": "partial", "source": "本批批准分析",
            "model": "gpt-6-astra", "reviewer": "gpt-6.1-sol medium",
            "description": description, "relation": description + "独立配置对照，不是纯effort对照。",
            "url": None, "experiment_id": experiment, "setting_sha": None,
            "observed_at": datetime.fromtimestamp(group["observed_unix"]).astimezone().isoformat(),
            "batch_complete": False, "review_state_sha256": group["review_state_sha256"],
            "aggregate_sha256": group["aggregate_sha256"],
        })
        data["runs"].extend(public_run(row, gid, profile) for row in group["rows"])
        for row in group["omitted"]:
            task = row["run"]["task"]
            data["missing"].append({
                "group": gid, **{k: row["run"][k] for k in ("task", "variant", "seed", "scene")},
                "run_id": row["run"]["run_id"], "status": "needs_attention",
                "reason": "用户排除：安全限制，未通过程序校验和复核。" if task == "build_tower"
                          else "HTTP 413请求体限制，未通过程序校验和复核。",
            })
    order = ["low", "persistent", "high", "o1compact", "o456"]
    data["groups"].sort(key=lambda g: order.index(g["id"]) if g["id"] in order else 100)
    data["o_audit_observed"] = datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat()
    data["audit_observed"] = "2026-10-25 03:37 +08:00"
    data["notes"].append(NOTE)
    data["inputs"].append({"name": "approved-o-export", "sha256": input_sha})
    assert len(data["runs"]) == len({r["id"] for r in data["runs"]}) == 416
    return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True, type=Path)
    parser.add_argument("--export", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    receipt = json.loads(args.export.read_bytes())
    returned = Path(receipt["receipt"])
    assert digest(returned) == receipt["receipt_sha256"]
    raw = json.loads(returned.read_bytes())
    assert raw["returncode"] == 0 and json.loads(raw["stdout"]) == receipt["value"]
    data = merge(json.loads(args.base.read_bytes()), receipt["value"], digest(args.export))
    data["built_at"] = datetime.now().astimezone().isoformat()
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    assert not PRIVATE.search(payload)
    for forbidden in ("rawreasoning", "rpc_body", "authorization", "credentials", "ROBOT_AUDIT_API_KEY"):
        assert forbidden.lower() not in payload.lower()
    args.out.write_text(payload, encoding="utf-8")
    args.out.with_name("data.js").write_text(
        "window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n", encoding="utf-8")
    print(json.dumps({"runs": len(data["runs"]), "data_sha256": digest(args.out)}))


if __name__ == "__main__":
    main()
