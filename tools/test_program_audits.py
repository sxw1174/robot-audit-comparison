"""Offline checks for explicitly authorized, non-approved publication."""
import copy
import json
from pathlib import Path
import unittest

from merge_completed_audits import EXPERIMENTS, GROUPS
from merge_program_audits import TASKS, merge


class ProgramMergeTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).resolve().parent.parent / "data.json").read_bytes())
        self.data["runs"] = [r for r in self.data["runs"] if r["audit"] != "complete"]
        self.export = dict(publication_policy="user_authorized_program_complete",
                           model_calls=0, remote_writes=0, approval_bypassed=False,
                           observed_unix=1793269550, groups={})
        for gid, tasks in TASKS.items():
            rows = []
            for task in sorted(tasks):
                rid = gid + "-" + task
                run = dict(run_id=rid, task=task, variant="standard", seed=0, scene=0)
                self.data["missing"].append(dict(group=gid, **run))
                rows.append(dict(
                    run=run, result=dict(run_id=rid, metrics=[
                        dict(id=f"M{i:02}", value=None, status="unavailable")
                        for i in range(1, 27)], events=[], coverage=[]),
                    native=dict(run_id=rid, protocol=dict(profile=GROUPS[gid][1]),
                                snapshot_id="a" * 64, result_sha256="b" * 64),
                    source_files={"result.json": dict(sha256="b" * 64, bytes=123)},
                    analysis_sha256="c" * 64, assignment_sha256="d" * 64,
                    fingerprint="e" * 64, review_batch="batch", videos=[],
                    program_validated=True, review_status="review_failed",
                    review_failure_kind="network_routing_failure", review_attempts=3,
                    access="codex_subscription"))
            self.export["groups"][gid] = dict(
                actual_owners=[], approved=0, program_validated=len(rows), rows=rows,
                experiment_id=EXPERIMENTS[gid], state_sha256="f" * 64,
                review_state_sha256="f" * 64, runtime_sha256="f" * 64)

    def row(self):
        return self.export["groups"]["o23456"]["rows"][0]

    def test_old_rows_preserved_and_new_rows_not_claimed_approved(self):
        before = copy.deepcopy(self.data["runs"])
        self.assertEqual(len(merge(self.data, self.export)), 5)
        self.assertEqual(self.data["runs"][:len(before)], before)
        for row in self.data["runs"][len(before):]:
            self.assertEqual(row["audit"], "complete")
            self.assertNotIn("review_fingerprint", row["source"])
            self.assertEqual(row["source"]["review_status"], "review_failed")

    def test_duplicate_import_rejected(self):
        merge(self.data, self.export)
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_live_owner_rejected(self):
        self.export["groups"]["o23456"]["actual_owners"] = [dict(pid=123)]
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_missing_program_validation_rejected(self):
        self.row()["program_validated"] = False
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_false_approval_status_rejected(self):
        self.row()["review_status"] = "approved"
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_profile_rejected(self):
        self.row()["native"]["protocol"]["profile"] = "wrong"
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_changed_native_source_rejected(self):
        self.row()["native"]["result_sha256"] = "0" * 64
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_assignment_tuple_rejected(self):
        self.row()["run"]["seed"] = 99
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_result_identity_rejected(self):
        self.row()["result"]["run_id"] = "other-run"
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)

    def test_wrong_experiment_rejected(self):
        self.export["groups"]["o23456"]["experiment_id"] = EXPERIMENTS["o23456compact"]
        with self.assertRaises(AssertionError):
            merge(self.data, self.export)


if __name__ == "__main__":
    unittest.main()
