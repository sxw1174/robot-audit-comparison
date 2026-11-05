"""Append approved server-side R4/EEF first-round audit rows to the dashboard."""

import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path


GROUPS = {
    "rsi-semantic-eef": {
        "id": "server-rsi-semantic-eef-20261104",
        "name": "R4 · rsi-semantic-eef",
        "long_name": "rsi-semantic-eef · medium · 2026-11-04 首轮42",
        "color": "#8a5f76",
    },
    "eef-relative-medium-r1": {
        "id": "server-eef-relative-medium-20261105",
        "name": "EEF · eef-relative-medium",
        "long_name": "eef-relative-medium-r1 · medium · 2026-11-05 首轮42",
        "color": "#4f7f95",
    },
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def reject_private(payload: str) -> None:
    forbidden = (
        "/Users/",
        "/data/user/",
        "/home/",
        "note_quote",
        "rawreasoning",
        "rpc_body",
        "authorization",
        "credentials",
        "ROBOT_AUDIT_API_KEY",
        "github_pat_",
        "ghp_",
    )
    lower = payload.lower()
    for token in forbidden:
        assert token.lower() not in lower, token


def merge(data: dict, export: dict, export_path: Path) -> dict:
    if export.get("schema_version") != "server-r4-eef-approved-dashboard-export-v1":
        raise AssertionError("unexpected R4/EEF export schema")
    if export.get("scope") != "official first-round 42 per configuration; devset excluded":
        raise AssertionError("unexpected R4/EEF export scope")

    by_id = {row["id"]: row for row in data["runs"]}
    added = []
    proof_groups = {}

    for export_gid, source in export["groups"].items():
        meta = GROUPS[export_gid]
        public_gid = meta["id"]
        rows = source["rows"]
        assert source["state_status"] == "approved_first_round_complete"
        assert source["actual_owners"] == []
        assert source["omitted"] == []
        assert len(rows) == len({row["id"] for row in rows}) == 42
        assert all(row["seed"] == 0 and row["scene"] == 0 for row in rows)
        assert all(row["audit"] == "approved" for row in rows)
        assert all(row["source"]["review_status"] == "approved" for row in rows)
        assert all(row["source"].get("validation_errors", []) == [] for row in rows)
        assert all(row["source"].get("program_validated") is True for row in rows)
        assert all(len(row["metrics"]) == 26 for row in rows)
        assert all("devset" not in json.dumps(row, ensure_ascii=False).lower() for row in rows)

        assert public_gid not in {group["id"] for group in data["groups"]}
        group = {
            "id": public_gid,
            "name": meta["name"],
            "long_name": meta["long_name"],
            "color": meta["color"],
            "effort": "medium",
            "family": export_gid,
            "planned": 42,
            "source": "本批服务器分析",
            "model": "gpt-6-astra",
            "reviewer": "gpt-6.1-sol medium",
            "audit": "complete",
            "batch_complete": True,
            "completed": 42,
            "needs_attention": 0,
            "paused": 0,
            "skipped": 0,
            "omitted": 0,
            "state_status": source["state_status"],
            "state_sha256": source["state_sha256"],
            "rolling_state_sha256": source["rolling_state_sha256"],
            "observed_at": source.get("observed_at"),
            "analysis_count": 42,
            "program_complete_count": 42,
            "review_pending": 0,
            "description": "服务器补充分析；官方首轮42，42项Main复核全部批准。",
            "relation": (
                "独立服务器补充分析；原生结果、程序校验和Main复核逐项保留，"
                "不进入现有固定主要结论。"
            ),
            "url": None,
        }
        data["groups"].append(group)

        group_added = 0
        for exported in rows:
            row = dict(exported)
            row["group"] = public_gid
            row["source"] = dict(row["source"])
            row["source"]["access"] = "server_analysis"
            row["source"]["program_validated"] = True
            if row["id"] in by_id:
                raise AssertionError(f"duplicate run id: {row['id']}")
            data["runs"].append(row)
            by_id[row["id"]] = row
            added.append(row["id"])
            group_added += 1

        proof_groups[public_gid] = {
            "source_group": export_gid,
            "planned": 42,
            "added_runs": group_added,
            "omitted_from_upload": [],
            "state_status": source["state_status"],
            "state_sha256": source["state_sha256"],
            "rolling_state_sha256": source["rolling_state_sha256"],
            "observed_at": source.get("observed_at"),
        }

    data["built_at"] = datetime.now().astimezone().isoformat()
    data["completion_observed"] = data["built_at"]
    data["inputs"].append({
        "name": "server-r4-eef-approved-export",
        "sha256": sha256(export_path),
    })
    note = (
        "服务器补充分析：R4与EEF各上传官方首轮42项Main复核批准结果；"
        "只统计官方首轮，排除devset。"
    )
    if note not in data["notes"]:
        data["notes"].append(note)

    return {
        "schema_version": "server-r4-eef-approved-dashboard-verification-v1",
        "previous_runs": len(data["runs"]) - len(added),
        "preserved_runs": len(data["runs"]) - len(added),
        "added_runs": len(added),
        "current_runs": len(data["runs"]),
        "added_groups": proof_groups,
        "main_review_performed": True,
        "raw_results_modified": False,
        "metrics_modified": False,
        "scope": "official first-round 42 per configuration; devset excluded",
        "previous_data_sha256": None,
        "export_sha256": sha256(export_path),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--export", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--proof", type=Path, required=True)
    args = parser.parse_args()

    data = json.loads(args.base.read_text(encoding="utf-8"))
    export = json.loads(args.export.read_text(encoding="utf-8"))
    before_sha = sha256(args.base)
    proof = merge(data, export, args.export)
    proof["previous_data_sha256"] = before_sha
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    reject_private(payload)
    args.out.write_text(payload, encoding="utf-8")
    args.out.with_name("data.js").write_text(
        "window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n",
        encoding="utf-8",
    )
    proof["data_sha256"] = sha256(args.out)
    args.proof.write_text(
        json.dumps(proof, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(proof, ensure_ascii=False))


if __name__ == "__main__":
    main()
