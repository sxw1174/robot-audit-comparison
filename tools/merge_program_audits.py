"""Publish explicitly authorized program-complete rows without inventing approval."""
import argparse
import copy
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

from build_dataset import PRIVATE
from merge_completed_audits import EXPERIMENTS, GROUPS
from merge_o_audits import public_run

TASKS = {
    "o23456": {"organize_table", "play_stacking_toy"},
    "o23456compact": {"fill_pen_holder", "play_stacking_toy", "store_laptop_and_headphones"},
}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def convert(row, gid):
    assert row["result"]["run_id"] == row["run"]["run_id"]
    for key in ("analysis_sha256", "assignment_sha256", "fingerprint"):
        assert re.fullmatch(r"[a-f0-9]{64}", row[key])
    assert row["program_validated"] is True
    assert row["review_status"] == "review_failed"
    assert row["review_failure_kind"] == "network_routing_failure"
    assert row["review_attempts"] == 3
    assert row["access"] == "codex_subscription"
    assert row["run"]["task"] in TASKS[gid]
    assert len(row["result"]["metrics"]) == 26
    _, profile, _, _ = GROUPS[gid]
    item = public_run(row, gid, profile)
    item["audit"] = "complete"
    source = item["source"]
    source["evidence_fingerprint"] = source.pop("review_fingerprint")
    source.update(access=row["access"], sampling_policy=row.get("sampling_policy"),
                  program_validated=True, review_status="review_failed",
                  review_failure_kind="network_routing_failure",
                  review_attempts=row["review_attempts"],
                  publication_policy="user_authorized_program_complete")
    return item


def merge(data, export):
    assert export["publication_policy"] == "user_authorized_program_complete"
    assert export["model_calls"] == export["remote_writes"] == 0
    assert export["approval_bypassed"] is False
    assert set(export["groups"]) == set(TASKS)
    old = {r["id"]: copy.deepcopy(r) for r in data["runs"]}
    assert len(old) == len(data["runs"])
    added = []
    for gid, batch in export["groups"].items():
        assert not batch["actual_owners"] and batch["approved"] == 0
        assert batch["program_validated"] == len(TASKS[gid]) == len(batch["rows"])
        assert batch["experiment_id"] == EXPERIMENTS[gid]
        assert {r["run"]["task"] for r in batch["rows"]} == TASKS[gid]
        for row in batch["rows"]:
            item = convert(row, gid)
            assert item["id"] not in old, "Never replace an existing public result"
            assert not any(r["id"] == item["id"] for r in data["runs"])
            assert not any(r["group"] == gid and
                           all(r[k] == item[k] for k in ("task", "variant", "seed", "scene"))
                           for r in data["runs"])
            missing = next(r for r in data["missing"] if r.get("run_id") == item["id"])
            assert missing["group"] == gid
            assert all(missing[k] == item[k] for k in ("task", "variant", "seed", "scene"))
            data["runs"].append(item)
            added.append(item["id"])
        data["missing"] = [r for r in data["missing"] if r.get("run_id") not in added]
        group = next(g for g in data["groups"] if g["id"] == gid)
        rows = [r for r in data["runs"] if r["group"] == gid]
        approved = sum(r["audit"] == "approved" for r in rows)
        group.update(analysis_count=len(rows), approved_count=approved,
                     program_complete_count=len(rows) - approved,
                     review_pending=len(rows) - approved, needs_attention=42 - len(rows),
                     description=f"官方首轮42；收录{len(rows)}项分析结果，原复核状态逐项保留。",
                     relation="统一收录程序完成结果；原生结果、程序校验和Main复核分别记录。",
                     observed_at=datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat())
        group["source_batches"].append({
            k: batch[k] for k in ("state_sha256", "review_state_sha256", "runtime_sha256")
        } | {"access": "codex_subscription", "approved": False, "program_validated": True})
        if gid == "o23456compact":
            group.update(available=42, upstream_missing=0)
            missing = [r for r in data["missing"] if r["group"] == gid]
            assert len(missing) == 1 and missing[0]["task"] == "store_tools_in_toolbox"
            missing[0].update(
                run_id="o23456-compact-first42-20261028-store_tools_in_toolbox-standard-s0-scene0",
                status="analysis_pending", reason="源记录已上传；原会话分析已恢复，尚无最终结果。")
    assert all(next(r for r in data["runs"] if r["id"] == rid) == row for rid, row in old.items())
    data["notes"].append(
        "用户授权统一纳入5项程序校验通过的补分析；Main因网络路由失败未批准，"
        "原状态及指纹保留在逐项来源中，不冒称复核通过。所选组统计纳入这些完成结果。")
    return added


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", type=Path, required=True)
    parser.add_argument("--previous-revision", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--proof", type=Path, required=True)
    args = parser.parse_args()
    export_raw = args.export.read_bytes()
    export = json.loads(export_raw)
    receipt_raw = args.export.with_name(args.export.stem + "-returned.json").read_bytes()
    receipt = json.loads(receipt_raw)
    assert receipt["returncode"] == 0 and json.loads(receipt["stdout"]) == export
    previous_raw = subprocess.check_output(["git", "show", args.previous_revision + ":data.json"])
    assert json.loads(args.out.read_bytes()) == json.loads(previous_raw)
    data = json.loads(previous_raw)
    added = merge(data, export)
    data["built_at"] = datetime.now().astimezone().isoformat()
    data["completion_observed"] = datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat()
    data["inputs"].append(dict(name="program-complete-supplement-export",
                               sha256=digest(export_raw), receipt_sha256=digest(receipt_raw)))
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    assert not PRIVATE.search(payload)
    for word in ("rawreasoning", "rpc_body", "authorization", "credentials", "ROBOT_AUDIT_API_KEY"):
        assert word.lower() not in payload.lower()
    checks = []
    for gid, group in export["groups"].items():
        for row in group["rows"]:
            expected = convert(row, gid)
            assert next(r for r in data["runs"] if r["id"] == expected["id"]) == expected
            checks.append(dict(run_id=expected["id"], group=gid,
                               analysis_sha256=row["analysis_sha256"],
                               evidence_fingerprint=row["fingerprint"],
                               metrics=26, events=len(expected["events"]), audit="complete"))
    proof = dict(previous_revision=args.previous_revision, previous_data_sha256=digest(previous_raw),
                 data_sha256=digest(payload.encode()), preserved_runs=len(json.loads(previous_raw)["runs"]),
                 added_runs=len(added), added_metrics_checked=26 * len(added),
                 added_events_checked=sum(r["events"] for r in checks),
                 original_public_rows_unchanged=True, source_metric_mismatches=0,
                 source_approval_verified=False, program_validation_verified=True,
                 publication_policy=export["publication_policy"], checks=checks,
                 export_sha256=digest(export_raw), receipt_sha256=digest(receipt_raw))
    args.out.write_text(payload, encoding="utf-8")
    args.out.with_name("data.js").write_text("window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n")
    args.proof.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in proof.items() if k != "checks"}))


if __name__ == "__main__":
    main()
