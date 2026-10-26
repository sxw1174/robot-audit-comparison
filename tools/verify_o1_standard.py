"""Verify an additive O1 Standard import against preserved and approved sources."""
import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

from build_dataset import digest
from merge_o_audits import public_run


def verify(root, exported, previous_revision):
    assert re.fullmatch(r"[a-f0-9]{7,40}", previous_revision)
    previous_bytes = subprocess.check_output(
        ["git", "show", previous_revision + ":data.json"], cwd=root
    )
    previous = json.loads(previous_bytes)
    previous_proof_path = root / "data-verification-20261026-v2.json"
    previous_proof = json.loads(previous_proof_path.read_bytes())
    previous_sha = hashlib.sha256(previous_bytes).hexdigest()
    assert previous_proof["data_sha256"] == previous_sha
    assert previous_proof["source_metric_mismatches"] == 0
    assert previous_proof["source_event_mismatches"] == 0
    current_path = root / "data.json"
    current = json.loads(current_path.read_bytes())
    for key, identity in (("groups", "id"), ("runs", "id")):
        actual = {row[identity]: row for row in current[key]}
        for old in previous[key]:
            assert actual[old[identity]] == old, (key, old[identity])
    assert current["metrics"] == previous["metrics"]
    for key in ("missing", "inputs", "notes"):
        assert all(row in current[key] for row in previous[key]), key
    assert current["audit_observed"] == previous["audit_observed"]
    assert current["o_audit_observed"] == previous["o_audit_observed"]

    receipt = json.loads(exported.read_bytes())
    returned = Path(receipt["receipt"])
    assert digest(returned) == receipt["receipt_sha256"]
    returned_data = json.loads(returned.read_bytes())
    assert returned_data["returncode"] == 0
    assert json.loads(returned_data["stdout"]) == receipt["value"]
    export = receipt["value"]
    assert export["model_calls"] == export["remote_writes"] == 0
    assert set(export["groups"]) == {"o1standard"}
    source = export["groups"]["o1standard"]
    assert not source["actual_owners"] and not source["batch_complete"]
    assert source["approved"] == source["program_validated"] == len(source["rows"]) == 41
    official = source["official_run_ids"]
    assert len(official) == len(set(official)) == 42
    assert source["state_status"] == "incomplete"
    metadata = next(g for g in current["groups"] if g["id"] == "o1standard")
    assert metadata["family"] == "persistent-cap20-o1"
    assert metadata["completed"] == 41 and metadata["needs_attention"] == 1
    assert metadata["batch_complete"] is False and metadata["audit"] == "partial"
    for key in ("review_state_sha256", "aggregate_sha256", "source_snapshot_id"):
        assert metadata[key] == source[key]
    rows = [r for r in current["runs"] if r["group"] == "o1standard"]
    expected = [public_run(r, "o1standard", "persistent-cap20-o1") for r in source["rows"]]
    assert rows == expected
    assert len(current["runs"]) == len({r["id"] for r in current["runs"]}) == 457
    assert len({(r["task"], r["variant"], r["seed"], r["scene"]) for r in rows}) == 41
    native_checks = []
    for row, original in zip(rows, source["rows"]):
        native = original["native"]
        assert row["id"] in official and row["id"] == native["run_id"]
        assert native["snapshot_id"] == source["source_snapshot_id"]
        assert original["result"]["run_id"] == row["id"]
        assert native["result_sha256"] == original["source_files"]["result.json"]["sha256"]
        for key in ("analysis_sha256", "fingerprint", "assignment_sha256"):
            assert re.fullmatch("[a-f0-9]{64}", original[key])
        for key in ("task", "variant", "seed", "scene"):
            assert row[key] == native["episode"][key]
        assert row["metrics"]["success"]["value"] == int(native["outcome"]["success"])
        assert row["metrics"]["score"]["value"] == native["outcome"]["score"]
        assert len(row["metrics"]) == len(original["result"]["metrics"]) == 26
        assert len(row["videos"]) == 3
        assert {v["path"] for v in original["videos"]} == {"head.mp4", "left_wrist.mp4", "right_wrist.mp4"}
        assert {Path(v["camera"]).stem for v in row["videos"]} == {"head", "left_wrist", "right_wrist"}
        assert all(v["bytes"] > 0 and re.fullmatch("[a-f0-9]{64}", v["sha256"]) for v in row["videos"])
        native_checks.append({
            "run_id": row["id"], "result_sha256": native["result_sha256"],
            "analysis_sha256": original["analysis_sha256"],
            "review_fingerprint": original["fingerprint"],
        })
    omitted = source["omitted"]
    assert len(omitted) == 1 and omitted[0]["run"]["task"] == "push_T"
    assert "413" in omitted[0]["reason"]
    assert set(official) == {r["id"] for r in rows} | {omitted[0]["run"]["run_id"]}
    missing = [r for r in current["missing"] if r["group"] == "o1standard"]
    assert len(missing) == 1 and missing[0]["run_id"] == omitted[0]["run"]["run_id"]
    assert "413" in missing[0]["reason"]
    input_digest = next(i["sha256"] for i in current["inputs"] if i["name"] == "approved-o1-standard-export")
    assert input_digest == digest(exported)
    new_events = sum(len(r["events"]) for r in rows)
    return {
        "schema_version": "additive-approved-audit-verification-v1",
        "verified_at": datetime.now().astimezone().isoformat(),
        "data_sha256": digest(current_path),
        "previous_data_sha256": previous_sha,
        "previous_revision": previous_revision,
        "previous_four_group_verification_sha256": digest(previous_proof_path),
        "preserved_runs": len(previous["runs"]),
        "added_group": "o1standard", "added_runs": 41,
        "source_metrics_checked": previous_proof["source_metrics_checked"] + 41 * 26,
        "source_events_checked": previous_proof["source_events_checked"] + new_events,
        "added_source_metrics_checked": 41 * 26,
        "added_source_events_checked": new_events,
        "source_metric_mismatches": 0, "source_event_mismatches": 0,
        "source_native_mismatches": 0,
        "approval_export_sha256": digest(exported),
        "approval_receipt_sha256": receipt["receipt_sha256"],
        "source_observed_at": metadata["observed_at"],
        "source_snapshot_id": source["source_snapshot_id"],
        "approved_native_summary": {
            "n": 41, "success": sum(r["metrics"]["success"]["value"] for r in rows),
            "score_total": sum(r["metrics"]["score"]["value"] for r in rows),
        },
        "source_native_checks": native_checks,
        "o456_scope_reconciliation": previous_proof["o456_scope_reconciliation"],
        "limits": [
            "The original 416 public rows are unchanged; prior four-group checks are reused.",
            "The new 41 rows match current approved canonical results and saved original native responses.",
            "No model calls, video re-audit, robot rerun or whole-batch acceptance.",
            "O1 Standard push_T is missing after HTTP 413; no placeholder numeric row.",
            "Fixed four-group conclusions do not include the new O1 Standard group.",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", required=True, type=Path)
    parser.add_argument("--previous-revision", default="083480d")
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    report = verify(root, args.export, args.previous_revision)
    with args.out.open("x", encoding="utf-8") as stream:
        json.dump(report, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")
    print(json.dumps({key: report[key] for key in (
        "preserved_runs", "added_runs", "added_source_metrics_checked",
        "added_source_events_checked", "source_native_mismatches", "approved_native_summary"
    )}))


if __name__ == "__main__":
    main()
