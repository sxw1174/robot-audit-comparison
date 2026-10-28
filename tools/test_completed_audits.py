"""Offline preservation and false-approval regression checks for additive imports."""
import copy
import json
from pathlib import Path
import unittest

from merge_completed_audits import merge


class CompletionMergeTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).resolve().parent.parent / "data.json").read_bytes())
        self.row = next(r for r in self.data["runs"] if r["group"] == "o456")

    def export(self):
        row = self.row
        return dict(groups=dict(o456=dict(
            actual_owners=[], approved=1, program_validated=1, batch_complete=False,
            source_batches=[], observed_unix=1793210392,
            rows=[dict(run=dict(run_id=row["id"]), analysis_sha256=row["source"]["analysis_sha256"],
                       fingerprint=row["source"]["review_fingerprint"],
                       native=dict(protocol=dict(profile=row["config"]["profile"])))],
            omitted=[dict(run=dict(run_id="omitted-" + str(i), task="task" + str(i),
                                   variant="standard", seed=0, scene=0), status="needs_attention")
                     for i in range(41)])))

    def test_existing_valid_rows_are_byte_preserved(self):
        data = copy.deepcopy(self.data)
        data["runs"] = [r for r in data["runs"] if r["group"] != "o456" or r["id"] == self.row["id"]]
        before = copy.deepcopy(data["runs"])
        self.assertEqual(merge(data, self.export()), [])
        self.assertEqual(data["runs"], before)

    def test_changed_approved_source_rejected(self):
        export = self.export()
        export["groups"]["o456"]["rows"][0]["analysis_sha256"] = "f" * 64
        with self.assertRaises(AssertionError):
            merge(copy.deepcopy(self.data), export)

    def test_live_snapshot_rejected(self):
        export = self.export()
        export["groups"]["o456"]["actual_owners"] = [dict(pid=1)]
        with self.assertRaises(AssertionError):
            merge(copy.deepcopy(self.data), export)

    def test_unvalidated_count_rejected(self):
        export = self.export()
        export["groups"]["o456"]["program_validated"] = 0
        with self.assertRaises(AssertionError):
            merge(copy.deepcopy(self.data), export)


if __name__ == "__main__":
    unittest.main()
