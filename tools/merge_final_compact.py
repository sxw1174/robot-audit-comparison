"""Add the source-bound final Compact result under the authorized program policy."""
import argparse
import copy
from datetime import datetime
import json
from pathlib import Path
import re
import subprocess

from build_dataset import PRIVATE
from merge_completed_audits import EXPERIMENTS, GROUPS
from merge_o_audits import public_run
from merge_program_audits import digest

GID = "o23456compact"
RUN = "o23456-compact-first42-20261028-store_tools_in_toolbox-standard-s0-scene0"


def convert(row):
    assert row["run"]["run_id"] == row["result"]["run_id"] == RUN
    assert [row["run"][k] for k in ("task", "variant", "seed", "scene")] == [
        "store_tools_in_toolbox", "standard", 0, 0]
    assert row["program_validated"] is True and row["validation_errors"] == []
    assert row["review_status"] == "approval_fingerprint_mismatch"
    assert row["recorded_review_status"] == "approved"
    assert row["recorded_review_fingerprint"] != row["fingerprint"]
    assert row["access"] == "codex_subscription"
    assert len(row["result"]["metrics"]) == 26
    for key in ("analysis_sha256", "assignment_sha256", "fingerprint",
                "recorded_review_fingerprint"):
        assert re.fullmatch(r"[a-f0-9]{64}", row[key])
    item = public_run(row, GID, GROUPS[GID][1])
    item["audit"] = "complete"
    source = item["source"]
    source["evidence_fingerprint"] = source.pop("review_fingerprint")
    source.update(access=row["access"], sampling_policy=row.get("sampling_policy"),
                  program_validated=True, review_status=row["review_status"],
                  recorded_review_status=row["recorded_review_status"],
                  recorded_review_fingerprint=row["recorded_review_fingerprint"],
                  review_attempts=row["review_attempts"],
                  publication_policy="user_authorized_program_complete")
    return item


def merge(data, export):
    assert export["publication_policy"] == "user_authorized_program_complete"
    assert export["model_calls"] == export["remote_writes"] == 0
    assert export["actual_owners"] == []
    assert export["group"] == GID and export["experiment_id"] == EXPERIMENTS[GID]
    item = convert(export["row"])
    old = copy.deepcopy(data["runs"])
    assert len({r["id"] for r in old}) == len(old)
    assert RUN not in {r["id"] for r in old}
    rows = [r for r in old if r["group"] == GID]
    assert len(rows) == 41
    assert not any(all(r[k] == item[k] for k in ("task", "variant", "seed", "scene"))
                   for r in rows)
    official = export["official_selected_run_ids"]
    assert len(official) == len(set(official)) == 42
    assert set(official) == {r["id"] for r in rows} | {RUN}
    missing = [r for r in data["missing"] if r["group"] == GID]
    assert len(missing) == 1 and missing[0]["run_id"] == RUN
    assert all(missing[0][k] == item[k] for k in ("task", "variant", "seed", "scene"))
    data["runs"].append(item)
    data["missing"] = [r for r in data["missing"] if r["group"] != GID]
    group = next(g for g in data["groups"] if g["id"] == GID)
    approved = sum(r["audit"] == "approved" for r in rows)
    group.update(analysis_count=42, approved_count=approved, completed=approved,
                 program_complete_count=42 - approved, review_pending=42 - approved,
                 needs_attention=0, available=42, upstream_missing=0,
                 source_snapshot_id=export["source_snapshot_id"],
                 observed_at=datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat(),
                 description="官方首轮42；收录42项分析结果，原复核状态逐项保留。",
                 relation="统一收录程序完成结果；原生结果、程序校验和Main复核分别记录。")
    group["source_batches"].append({
        k: export[k] for k in ("state_sha256", "review_state_sha256", "runtime_sha256",
                              "source_plan_sha256", "batch_complete")
    } | dict(access="codex_subscription", approved=False, program_validated=True,
             review_status="approval_fingerprint_mismatch"))
    data["notes"].append(
        "Compact最后一项store_tools_in_toolbox已完成并通过原程序校验，统一纳入42项统计；"
        "Main曾批准旧指纹，当前指纹不一致，按用户授权纳入且不冒称当前复核批准。")
    assert data["runs"][:-1] == old
    return item


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", type=Path, required=True)
    parser.add_argument("--previous-revision", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--proof", type=Path, required=True)
    args = parser.parse_args()
    raw_export = args.export.read_bytes()
    export = json.loads(raw_export)
    raw_receipt = args.export.with_name(args.export.stem + "-returned.json").read_bytes()
    receipt = json.loads(raw_receipt)
    assert receipt["returncode"] == 0 and json.loads(receipt["stdout"]) == export
    previous_raw = subprocess.check_output(["git", "show", args.previous_revision + ":data.json"])
    data = json.loads(previous_raw)
    assert json.loads(args.out.read_bytes()) == data
    item = merge(data, export)
    data["built_at"] = datetime.now().astimezone().isoformat()
    data["completion_observed"] = datetime.fromtimestamp(export["observed_unix"]).astimezone().isoformat()
    data["inputs"].append(dict(name="final-compact-program-export",
                               sha256=digest(raw_export), receipt_sha256=digest(raw_receipt)))
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    assert not PRIVATE.search(payload)
    for forbidden in ("rawreasoning", "rpc_body", "authorization", "credentials",
                      "ROBOT_AUDIT_API_KEY"):
        assert forbidden.lower() not in payload.lower()
    proof = dict(previous_revision=args.previous_revision,
                 previous_data_sha256=digest(previous_raw), data_sha256=digest(payload.encode()),
                 preserved_runs=len(data["runs"]) - 1, added_runs=1,
                 added_metrics_checked=26, added_events_checked=len(item["events"]),
                 original_public_rows_unchanged=True, source_metric_mismatches=0,
                 source_approval_verified=False, program_validation_verified=True,
                 publication_policy=export["publication_policy"],
                 export_sha256=digest(raw_export), receipt_sha256=digest(raw_receipt),
                 checks=[dict(run_id=RUN, group=GID,
                              analysis_sha256=item["source"]["analysis_sha256"],
                              evidence_fingerprint=item["source"]["evidence_fingerprint"],
                              recorded_review_fingerprint=item["source"]["recorded_review_fingerprint"],
                              review_status=item["source"]["review_status"],
                              metrics=26, events=len(item["events"]), audit="complete")])
    args.out.write_text(payload, encoding="utf-8")
    args.out.with_name("data.js").write_text(
        "window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n", encoding="utf-8")
    args.proof.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in proof.items() if k != "checks"}))


if __name__ == "__main__":
    main()
