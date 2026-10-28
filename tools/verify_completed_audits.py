"""Verify an additive publication against its original commit and private export."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

from merge_o_audits import public_run
from merge_completed_audits import GROUPS


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", required=True, type=Path)
    parser.add_argument("--data", default=Path("data.json"), type=Path)
    parser.add_argument("--previous-revision", default="1347c79")
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    export = json.loads(args.export.read_bytes())
    returned = args.export.with_name(args.export.stem + "-returned.json")
    receipt = json.loads(returned.read_bytes())
    assert receipt["returncode"] == 0 and json.loads(receipt["stdout"]) == export
    raw = args.data.read_bytes()
    data = json.loads(raw)
    previous_raw = subprocess.check_output(["git", "show", args.previous_revision + ":data.json"])
    previous = json.loads(previous_raw)
    old = {r["id"]: r for r in previous["runs"]}
    current = {r["id"]: r for r in data["runs"]}
    assert len(current) == len(data["runs"])
    for rid, row in old.items():
        assert current[rid] == row, "Existing public row changed: " + rid
    checks = []
    for gid, source in export["groups"].items():
        if gid not in GROUPS:
            continue
        _, profile, effort, _ = GROUPS[gid]
        for row in source["rows"]:
            rid = row["run"]["run_id"]
            actual = current[rid]
            assert actual["source"]["analysis_sha256"] == row["analysis_sha256"]
            assert actual["source"].get("review_fingerprint", row["fingerprint"]) == row["fingerprint"]
            if rid not in old:
                expected = public_run(row, gid, profile)
                expected["config"]["effort"] = effort
                expected["source"]["access"] = row["access"]
                expected["source"]["sampling_policy"] = row.get("sampling_policy")
                assert actual == expected
                checks.append(dict(run_id=rid, group=gid, analysis_sha256=row["analysis_sha256"],
                                   review_fingerprint=row["fingerprint"], metrics=26,
                                   events=len(actual["events"]), access=row["access"]))
    assert set(current) - set(old) == {r["run_id"] for r in checks}
    report = dict(
        data_sha256=sha(raw), previous_revision=args.previous_revision,
        previous_data_sha256=sha(previous_raw), preserved_runs=len(old),
        added_runs=len(checks), added_metrics_checked=26 * len(checks),
        added_events_checked=sum(r["events"] for r in checks),
        original_public_rows_unchanged=True, source_metric_mismatches=0,
        export_sha256=sha(args.export.read_bytes()), receipt_sha256=sha(returned.read_bytes()),
        approved_counts={g["id"]: len([r for r in data["runs"] if r["group"] == g["id"]])
                         for g in data["groups"] if g["source"] == "本批批准分析"},
        visual_rereview_by_importer=False, source_approval_and_fingerprint_verified=True,
        checks=checks)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k != "checks"}))


if __name__ == "__main__":
    main()
