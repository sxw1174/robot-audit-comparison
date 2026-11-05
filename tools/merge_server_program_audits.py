"""Append completed server-side R1/R2 audit rows to the public dashboard."""

import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path


GROUPS = {
    "persistent-cap20-r1": {
        "id": "server-persistent-cap20-r1-20261104",
        "name": "R1 · persistent-cap20",
        "long_name": "persistent-cap20-r1 · medium · 2026-11-04 首轮42",
        "color": "#7567a8",
        "skipped": 1,
    },
    "persistent-cap20-r2": {
        "id": "server-persistent-cap20-r2-20261104",
        "name": "R2 · persistent-cap20",
        "long_name": "persistent-cap20-r2 · medium · 2026-11-04 首轮42",
        "color": "#5f8f78",
        "skipped": 0,
    },
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reject_private(payload: str) -> None:
    forbidden = (
        "/Users/",
        "/data/user/",
        "/home/",
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
    by_id = {row["id"]: row for row in data["runs"]}
    added = []
    proof_groups = {}

    for export_gid, source in export["groups"].items():
        meta = GROUPS[export_gid]
        public_gid = meta["id"]
        rows = source["rows"]
        assert not source["actual_owners"]
        assert len(rows) == len({row["id"] for row in rows})
        assert len(rows) + len(source["omitted"]) + meta["skipped"] == 42
        assert all(row["seed"] == 0 and row["scene"] == 0 for row in rows)
        assert all(row["audit"] == "complete" for row in rows)
        assert all(row["source"]["review_status"] == "complete" for row in rows)
        assert all(row["source"].get("validation_errors", []) == [] for row in rows)
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
            "batch_complete": False,
            "completed": len(rows),
            "needs_attention": sum(
                item.get("status") == "needs_attention"
                for item in source["omitted"]
            ),
            "paused": sum(item.get("status") == "paused" for item in source["omitted"]),
            "skipped": meta["skipped"],
            "omitted": len(source["omitted"]) + meta["skipped"],
            "state_status": source["state_status"],
            "state_sha256": source["state_sha256"],
            "observed_at": source.get("observed_at"),
            "analysis_count": len(rows),
            "program_complete_count": len(rows),
            "review_pending": len(source["omitted"]) + meta["skipped"],
            "description": (
                f"服务器补充分析；官方首轮42，已上传{len(rows)}项程序完成结果；"
                "未完成项暂不上传。"
            ),
            "relation": (
                "独立服务器补充分析；原生结果、程序校验和复核状态逐项保留，"
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
            "omitted_from_upload": source["omitted"],
            "explicitly_skipped": meta["skipped"],
            "state_status": source["state_status"],
            "state_sha256": source["state_sha256"],
        }

    data["built_at"] = datetime.now().astimezone().isoformat()
    data["completion_observed"] = data["built_at"]
    data["inputs"].append({
        "name": "server-program-complete-r1-r2-export",
        "sha256": sha256(export_path),
    })
    note = (
        "服务器补充分析：R1上传40项、R2上传39项程序完成结果；"
        "只纳入官方首轮，排除devset；未完成项暂不上传，原复核状态保留。"
    )
    if note not in data["notes"]:
        data["notes"].append(note)
    return {
        "schema_version": "server-program-complete-dashboard-verification-v1",
        "previous_runs": len(data["runs"]) - len(added),
        "preserved_runs": len(data["runs"]) - len(added),
        "added_runs": len(added),
        "current_runs": len(data["runs"]),
        "added_groups": proof_groups,
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
