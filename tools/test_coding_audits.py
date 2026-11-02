"""Offline regression checks for source identity, approval claims and additive publication."""
import copy
import json
from pathlib import Path
import unittest

from build_dataset import FIELDS
from merge_coding_audits import EXPERIMENT, GID, PROFILE, SNAPSHOT, convert, merge


class CodingImportTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).resolve().parent.parent / 'data.json').read_bytes())
        rows = [r for r in self.data['runs'] if r['group'] == GID]
        self.rows = []
        for r in rows:
            self.rows.append(dict(run=dict(run_id=r['id'], experiment_id=EXPERIMENT,
                **{k:r[k] for k in ['task', 'variant', 'seed', 'scene']}),
                result=dict(run_id=r['id'], review_status='complete', summary='', limitations=[],
                    metrics=[dict(id=f'm{i:02d}', value=r['metrics'][field]['value'],
                                  status=r['metrics'][field]['original_status'])
                             for i,field in enumerate(FIELDS,1)], events=[], coverage=[]),
                native=dict(run_id=r['id'], snapshot_id=SNAPSHOT,
                    protocol=dict(id=r["source"]["native_protocol_id"], profile=PROFILE, max_decisions=None, native_control_cap=20),
                    result_sha256='a'*64, configuration_parameters=r['config'],
                    outcome={k:r['metrics'][field]['value'] for field,k in
                             [('success','success'),('score','score'),('turns','model_decisions'),('actions','native_controls')]}),
                source_files={'result.json':dict(sha256='a'*64, bytes=1)},
                analysis_sha256=r['source']['analysis_sha256'],
                assignment_sha256=r['source']['assignment_sha256'],
                fingerprint=r['source'].get('review_fingerprint',r['source'].get('evidence_fingerprint')),
                recorded_review_fingerprint=r['source']['recorded_review_fingerprint'],
                recorded_review_status='approved', current_approved=r['audit']=='approved',
                review_status=r['source']['review_status'], review_batch='test',
                program_validated=True, validation_errors=[], access='relay',
                sampling_policy={}, videos=r['videos']))
        self.export=dict(group=GID, experiment_id=EXPERIMENT, profile=PROFILE, snapshot_id=SNAPSHOT,
            actual_owners=[], model_calls=0, remote_writes=0, program_validated=42, approved=38,
            publication_policy='user_authorized_program_complete', batch_complete=True, work_complete=True,
            available_evidence_review_complete=True, main_review=dict(approved=True),
            official_selected_run_ids=[r['run']['run_id'] for r in self.rows], rows=self.rows,
            observed_unix=1793628986, source_state_sha256={})
        self.data['runs']=[r for r in self.data['runs'] if r['group']!=GID]
        self.data['groups']=[g for g in self.data['groups'] if g['id']!=GID]

    def test_preserves_every_old_object(self):
        before=copy.deepcopy(self.data['runs'])
        merge(self.data,self.export)
        self.assertEqual(self.data['runs'][:-42],before)
        self.assertEqual(sum(r['audit']=='complete' for r in self.data['runs'][-42:]),4)

    def test_stale_fingerprint_cannot_be_labeled_approved(self):
        row=next(r for r in self.rows if not r['current_approved'])
        row['current_approved']=True
        with self.assertRaises(AssertionError):convert(row)

    def test_live_output_rejected(self):
        self.export['actual_owners']=[dict(pid=1)]
        with self.assertRaises(AssertionError):merge(self.data,self.export)

    def test_wrong_experiment_rejected(self):
        self.rows[0]['run']['experiment_id']='other'
        with self.assertRaises(AssertionError):merge(self.data,self.export)

    def test_duplicate_official_members_rejected(self):
        self.export['official_selected_run_ids'][0]=self.export['official_selected_run_ids'][1]
        with self.assertRaises(AssertionError):merge(self.data,self.export)

    def test_unlimited_decisions_cannot_be_overwritten(self):
        self.rows[0]['native']['configuration_parameters']['max_decisions']=100
        with self.assertRaises(AssertionError):convert(self.rows[0])


if __name__=='__main__':unittest.main()
