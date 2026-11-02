"""Add the official 42 source-bound Coding audits without rewriting prior records."""
import argparse
import copy
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

from build_dataset import PRIVATE
from merge_o_audits import public_run

GID = 'o23depthprocoding'
EXPERIMENT = 'f491af77916615632067bbb1fe5a44e934cdfdd043d434afffb1ac44be9aa0d8'
PROFILE = 'o23-depthpro-coding-unlimited-v1'
SNAPSHOT = '538895bc659ecb80a90791e574a504728d90ff0848873a1a25447bb2ec6f4bab'


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def convert(row):
    run, native = row['run'], row['native']
    assert run['run_id'] == row['result']['run_id'] == native['run_id']
    assert run['experiment_id'] == EXPERIMENT
    assert run['seed'] == run['scene'] == 0
    assert native['snapshot_id'] == SNAPSHOT and native['protocol']['profile'] == PROFILE
    assert native['protocol']['max_decisions'] is None and native['protocol']['native_control_cap'] == 20
    assert row['program_validated'] is True and row['validation_errors'] == []
    assert row['result']['review_status'] == 'complete' and row['access'] == 'relay'
    assert len(row['videos']) == 3
    for key in ['analysis_sha256', 'assignment_sha256', 'fingerprint']:
        assert re.fullmatch('[a-f0-9]{64}', row[key])
    cfg = native['configuration_parameters']
    assert cfg['profile'] == PROFILE and cfg['coding'] == 'native'
    assert cfg['decision_limit'] == 'unlimited' and cfg['max_decisions'] is None
    assert cfg['effort'] == 'medium' and cfg['model'] == 'gpt-6-astra'
    item = public_run(row, GID, PROFILE)
    item['config'].update(max_decisions=None, coding='native', decision_limit='unlimited',
                          observations=cfg['observations'], observation_level=cfg['observation_level'],
                          observation_format=cfg['observation_format'])
    assert row['recorded_review_status'] == 'approved'
    assert row['current_approved'] == (row['fingerprint'] == row['recorded_review_fingerprint'])
    assert row['review_status'] == ('approved' if row['current_approved'] else 'approval_fingerprint_mismatch')
    if not row['current_approved']:
        item['audit'] = 'complete'
        item['source']['evidence_fingerprint'] = item['source'].pop('review_fingerprint')
    item['source'].update(access='relay', sampling_policy=row['sampling_policy'],
                          program_validated=True, review_status=row['review_status'],
                          recorded_review_status=row['recorded_review_status'],
                          recorded_review_fingerprint=row['recorded_review_fingerprint'],
                          publication_policy='user_authorized_program_complete',
                          native_experiment_id=EXPERIMENT, native_protocol_id=native['protocol']['id'])
    for field, key in [('success', 'success'), ('score', 'score'), ('turns', 'model_decisions'),
                       ('actions', 'native_controls')]:
        assert item['metrics'][field]['value'] == native['outcome'][key]
    return item


def merge(data, export):
    assert export['group'] == GID and export['experiment_id'] == EXPERIMENT
    assert export['profile'] == PROFILE and export['snapshot_id'] == SNAPSHOT
    assert export['actual_owners'] == [] and export['model_calls'] == export['remote_writes'] == 0
    assert export['program_validated'] == len(export['rows']) == 42
    assert export['publication_policy'] == 'user_authorized_program_complete'
    assert export['approved'] == sum(r['current_approved'] for r in export['rows'])
    assert export['batch_complete'] is True and export['work_complete'] is True
    assert export['available_evidence_review_complete'] is True
    assert export['main_review']['approved'] is True
    ids = export['official_selected_run_ids']
    assert len(set(ids)) == len(ids) == 42
    rows = [convert(row) for row in export['rows']]
    assert set(ids) == {r['id'] for r in rows}
    assert len({tuple(r[k] for k in ['task', 'variant', 'seed', 'scene']) for r in rows}) == 42
    assert len({r['task'] for r in rows}) == 42
    old = copy.deepcopy(data['runs'])
    assert not set(ids) & {r['id'] for r in old}
    assert not any(g['id'] == GID for g in data['groups'])
    data['groups'].append(dict(id=GID, name='O23 DepthPro + Coding',
        long_name='O23-DepthPro + Coding · 首轮42', family=PROFILE, color='#6570ad',
        effort='medium', model='gpt-6-astra', reviewer='gpt-6.1-sol medium', planned=42,
        analysis_count=42, completed=export['approved'], approved_count=export['approved'],
        program_complete_count=42-export['approved'], review_pending=42-export['approved'], needs_attention=0,
        available=42, upstream_missing=0, audit='approved', source='本批批准分析',
        experiment_id=EXPERIMENT, source_snapshot_id=SNAPSHOT, batch_complete=True,
        description='官方首轮42；全部程序校验及整批最终验收通过，当前逐项复核状态分别保留。',
        relation='Compact O1/O2、DepthPro预测深度、native coding、决策次数不限；独立配置对照。',
        url=None, observed_at=datetime.fromtimestamp(export['observed_unix']).astimezone().isoformat(),
        source_batches=[dict(access='relay', approved=export['approved'], program_validated=42, batch_complete=True,
                            source_state_sha256=export['source_state_sha256'])]))
    data['runs'].extend(rows)
    assert data['runs'][:-42] == old
    assert len({r['id'] for r in data['runs']}) == len(data['runs'])
    data['notes'].append('O23 DepthPro + Coding官方首轮42项使用中转站gpt-6.1-sol medium完成分析；'
                         '42项通过原程序校验及整批最终验收；'+str(42-export['approved'])+'项当前证据与先前逐项批准指纹不同，保留真实状态。'
                         'native coding、决策次数不限；与原阶段性O23 DepthPro分别统计。')
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--export', type=Path, required=True)
    parser.add_argument('--previous-revision', required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--proof', type=Path, required=True)
    args = parser.parse_args()
    raw_export = args.export.read_bytes()
    export = json.loads(raw_export)
    receipt_raw = args.export.with_name(args.export.stem + '-returned.json').read_bytes()
    receipt = json.loads(receipt_raw)
    assert receipt['returncode'] == 0 and json.loads(receipt['stdout']) == export
    previous_raw = subprocess.check_output(['git', 'show', args.previous_revision + ':data.json'])
    data = json.loads(previous_raw)
    assert json.loads(args.out.read_bytes()) == data
    rows = merge(data, export)
    data['built_at'] = datetime.now().astimezone().isoformat()
    data['completion_observed'] = datetime.fromtimestamp(export['observed_unix']).astimezone().isoformat()
    data['inputs'].append(dict(name='approved-coding-first42-export', sha256=digest(raw_export),
                               receipt_sha256=digest(receipt_raw)))
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    assert not PRIVATE.search(payload)
    for forbidden in ['rawreasoning', 'rpc_body', 'authorization', 'credentials', 'ROBOT_AUDIT_API_KEY']:
        assert forbidden.lower() not in payload.lower()
    proof = dict(previous_revision=args.previous_revision, previous_data_sha256=digest(previous_raw),
        data_sha256=digest(payload.encode()), preserved_runs=len(data['runs']) - len(rows),
        added_runs=len(rows), added_metrics_checked=len(rows) * 26,
        added_events_checked=sum(len(r['events']) for r in rows),
        original_public_rows_unchanged=True, source_metric_mismatches=0,
        program_validation_verified=True, source_approval_and_fingerprint_verified=export['approved']==42,
        current_fingerprint_approved=export['approved'], program_complete=42-export['approved'],
        batch_complete=export['batch_complete'], actual_owners=[], model_calls=0, remote_writes=0,
        experiment_id=EXPERIMENT, source_snapshot_id=SNAPSHOT,
        export_sha256=digest(raw_export), receipt_sha256=digest(receipt_raw),
        manifest_sha256=export['manifest_sha256'], checksums_sha256=export['checksums_sha256'],
        native_success=sum(r['metrics']['success']['value'] for r in rows),
        native_score_total=sum(r['metrics']['score']['value'] for r in rows),
        checks=[dict(run_id=r['id'], group=GID, analysis_sha256=r['source']['analysis_sha256'],
                     assignment_sha256=r['source']['assignment_sha256'],
                     evidence_fingerprint=r['source'].get('review_fingerprint',r['source'].get('evidence_fingerprint')),
                     review_status=r['source']['review_status'],
                     metrics=26, events=len(r['events']), access='relay') for r in rows])
    args.out.write_text(payload, encoding='utf-8')
    args.out.with_name('data.js').write_text('window.AUDIT_DATA=' + payload.replace('</', '<\\/') + ';\n', encoding='utf-8')
    args.proof.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in proof.items() if k != 'checks'}))


if __name__ == '__main__':
    main()
