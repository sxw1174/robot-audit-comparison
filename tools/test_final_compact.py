"""Offline final-row publication checks, with no model or network calls."""
import copy
import json
from pathlib import Path
import unittest

from merge_completed_audits import EXPERIMENTS, GROUPS
from merge_final_compact import GID, RUN, merge


class FinalCompactTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).resolve().parent.parent / "data.json").read_bytes())
        self.data["runs"] = [r for r in self.data["runs"] if r["id"] != RUN]
        self.data["missing"] = [r for r in self.data["missing"] if r["group"] != GID]
        run = dict(run_id=RUN, task="store_tools_in_toolbox", variant="standard", seed=0, scene=0)
        self.data["missing"].append(dict(group=GID, **run))
        row = dict(
            run=run, result=dict(run_id=RUN, metrics=[
                dict(id=f"M{i:02}", value=None, status="unavailable") for i in range(1, 27)],
                events=[], coverage=[]),
            native=dict(run_id=RUN, protocol=dict(profile=GROUPS[GID][1]),
                        snapshot_id="a" * 64, result_sha256="b" * 64),
            source_files={"result.json": dict(sha256="b" * 64, bytes=123)},
            analysis_sha256="c" * 64, assignment_sha256="d" * 64, fingerprint="e" * 64,
            recorded_review_fingerprint="f" * 64, review_status="approval_fingerprint_mismatch",
            recorded_review_status="approved", review_batch="batch", review_attempts=2,
            videos=[], validation_errors=[], program_validated=True, access="codex_subscription")
        self.export = dict(
            row=row, group=GID, experiment_id=EXPERIMENTS[GID],
            actual_owners=[], model_calls=0, remote_writes=0,
            publication_policy="user_authorized_program_complete", observed_unix=1793294022,
            official_selected_run_ids=[r["id"] for r in self.data["runs"] if r["group"] == GID] + [RUN],
            state_sha256="a" * 64, review_state_sha256="b" * 64, runtime_sha256="c" * 64,
            source_plan_sha256="d" * 64, source_snapshot_id="e" * 64, batch_complete=False)

    def test_preserves_old_rows_and_real_approval_state(self):
        old = copy.deepcopy(self.data["runs"])
        item = merge(self.data, self.export)
        self.assertEqual(self.data["runs"][:-1], old)
        self.assertEqual(item["audit"], "complete")
        self.assertNotIn("review_fingerprint", item["source"])
        self.assertNotEqual(item["source"]["recorded_review_fingerprint"],
                            item["source"]["evidence_fingerprint"])
        group = next(g for g in self.data["groups"] if g["id"] == GID)
        self.assertEqual((group["analysis_count"], group["approved_count"],
                          group["program_complete_count"], group["needs_attention"]), (42, 38, 4, 0))
        self.assertFalse(any(r["group"] == GID for r in self.data["missing"]))

    def test_duplicate_rejected(self):
        merge(self.data, self.export)
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_live_owner_rejected(self):
        self.export["actual_owners"] = [dict(pid=123)]
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_unvalidated_rejected(self):
        self.export["row"]["validation_errors"] = ["missing frame"]
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_source_rejected(self):
        self.export["row"]["native"]["result_sha256"] = "0" * 64
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_official_selection_rejected(self):
        self.export["official_selected_run_ids"][0] = "other"
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_fabricated_current_approval_rejected(self):
        self.export["row"]["review_status"] = "approved"
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_tuple_rejected(self):
        self.export["row"]["run"]["seed"] = 1
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)


if __name__ == "__main__":
    unittest.main()
