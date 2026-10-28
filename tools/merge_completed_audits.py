"""Add only receipt-bound approved first-round results; never replace valid rows."""
import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path

from build_dataset import PRIVATE
from merge_o_audits import public_run

GROUPS = {
    "high": ("High", "persistent-cap20", "high", "#c76b58"),
    "o1compact": ("O1 Compact", "persistent-cap20-o1-compact", "medium", "#8a6bb8"),
    "o456": ("O456 Clear", "persistent-cap20-o456-clear", "medium", "#b06b3f"),
    "o1standard": ("O1 Standard", "persistent-cap20-o1", "medium", "#b24e70"),
    "o23456": ("O23456 Clear", "persistent-cap20-o23456-clear", "medium", "#40816e"),
    "sixfig": ("O23456 DepthPro 6fig CUDA", "persistent-cap20-o23456-depthpro-6fig-cuda", "medium", "#467caa"),
}
EXPERIMENTS = {
    "o23456": "5e605940d01cf6fb166d14b9f4d57284857862eca2236ebd86b017f986cbc071",
    "sixfig": "f43c2624d14b3b7c76f29fc35f662822e4ad7c5cd93972c06caf448e1f46602c",
}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def merge(data, export):
    by_id = {r["id"]: r for r in data["runs"]}
    added = []
    for gid, source in export["groups"].items():
        assert gid in GROUPS and not source["actual_owners"]
        assert source["approved"] == source["program_validated"] == len(source["rows"])
        assert len(source["rows"]) + len(source["omitted"]) == 42
        name, profile, effort, color = GROUPS[gid]
        group = next((g for g in data["groups"] if g["id"] == gid), None)
        if group is None:
            group = dict(id=gid, name=name, long_name=profile + " · 首轮42",
                         color=color, effort=effort, family=profile, planned=42,
                         source="本批批准分析", model="gpt-6-astra",
                         reviewer="gpt-6.1-sol medium", url=None)
            group["experiment_id"] = EXPERIMENTS[gid]
            data["groups"].append(group)
        source_ids = set()
        for row in source["rows"]:
            rid = row["run"]["run_id"]
            assert rid not in source_ids
            source_ids.add(rid)
            assert row["native"]["protocol"]["profile"] == profile
            if rid in by_id:
                old = by_id[rid]
                assert old["group"] == gid
                assert old["source"]["analysis_sha256"] == row["analysis_sha256"]
                assert old["source"].get("review_fingerprint", row["fingerprint"]) == row["fingerprint"]
                continue
            item = public_run(row, gid, profile)
            item["config"]["effort"] = effort
            item["source"]["access"] = row["access"]
            item["source"]["sampling_policy"] = row.get("sampling_policy")
            data["runs"].append(item)
            by_id[rid] = item
            added.append(rid)
        existing = [r for r in data["runs"] if r["group"] == gid]
        assert {r["id"] for r in existing} == source_ids
        n = len(existing)
        group.update(completed=n, needs_attention=42 - n, audit="approved" if n == 42 else "partial",
                     batch_complete=source["batch_complete"],
                     observed_at=datetime.fromtimestamp(source["observed_unix"]).astimezone().isoformat(),
                     source_batches=source["source_batches"])
        group["description"] = f"官方首轮42；{n}项程序校验且复核批准。"
        group["relation"] = group["description"] + "独立配置；非纯effort对照。" if gid != "high" else group.get("relation")
        data["missing"] = [r for r in data.get("missing", []) if r["group"] != gid]
        data["missing"].extend(dict(
            group=gid, **{k: r["run"][k] for k in ("task", "variant", "seed", "scene")},
            run_id=r["run"]["run_id"], status=r["status"],
            reason=r.get("reason") or "尚未通过当前程序校验和复核")
            for r in source["omitted"])
    if {"o1compact", "o456"} & set(export["groups"]):
        data["notes"] = [note for note in data["notes"] if not note.startswith(
            "O1 Compact与O456 Clear分别收录")]
        counts = {gid: sum(r["group"] == gid for r in data["runs"])
                  for gid in ("o1compact", "o456")}
        data["notes"].append(
            f"O1 Compact与O456 Clear分别收录{counts['o1compact']}/42、"
            f"{counts['o456']}/42项程序校验且当前复核批准的结果；"
            "整批最终验收单独披露，缺失项不进入指标、事件或配对统计。")
    assert len(by_id) == len(data["runs"])
    return added


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--export", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    export = json.loads(args.export.read_bytes())
    returned = args.export.with_name(args.export.stem + "-returned.json")
    receipt = json.loads(returned.read_bytes())
    assert receipt["returncode"] == 0 and json.loads(receipt["stdout"]) == export
    data = json.loads(args.base.read_bytes())
    added = merge(data, export)
    data["completion_observed"] = datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat()
    data["built_at"] = datetime.now().astimezone().isoformat()
    data["inputs"].append(dict(name="approved-completion-export", sha256=sha(args.export),
                               receipt_sha256=sha(returned)))
    note = "缺项由服务器现有Codex订阅账号的gpt-6.1-sol medium独立补分析；历史有效分析原样保留，来源逐项标注。"
    if note not in data["notes"]:
        data["notes"].append(note)
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    assert not PRIVATE.search(payload)
    for forbidden in ("rawreasoning", "rpc_body", "authorization", "credentials", "ROBOT_AUDIT_API_KEY"):
        assert forbidden.lower() not in payload.lower()
    args.out.write_text(payload, encoding="utf-8")
    args.out.with_name("data.js").write_text(
        "window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n", encoding="utf-8")
    print(json.dumps(dict(added=len(added), preserved=len(data["runs"]) - len(added),
                         runs=len(data["runs"]), data_sha256=sha(args.out))))


if __name__ == "__main__":
    main()
