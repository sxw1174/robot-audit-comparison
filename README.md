# RoboDojo Behavior Comparison

An independent, read-only research preview of first-round behavior audits.
Low, High, O1 Compact and O456 Clear are the groups analyzed in this round.
Historical and interim groups imported from the public behavior board remain
ordinary selectable reference groups and are labeled by source. The overview
keeps six fixed, evidence-linked findings from all four groups' common first
round. Selected groups control the statistics, distributions, task tables and
event evidence below, but never rewrite the conclusions.

**Preview:** https://sxw1174.github.io/robot-audit-comparison/

## Scope

- Low: 42 approved analyses. High: 41 approved analyses; `push_T` remains missing.
- O1 Compact: 40/42 program-valid, currently review-approved analyses.
  `build_tower` and `push_T` are excluded and documented as missing.
- O456 Clear: 41/42 program-valid, currently review-approved analyses.
  `push_T` is missing because the provider returned HTTP 413.
- Neither O batch has final whole-batch acceptance. Only the 81 approved
  canonical results enter metrics, events and pair comparisons. Robot model:
  gpt-6-astra medium; audit/review model: gpt-6.1-sol medium.
- Historical Medium: 42 published runs, with 25 Sim5.1 and 17 Sim6 records.
- Five other published groups are available as separate configuration references.
- O23 Compact and O23 DepthPro remain explicitly marked interim.
- 416 run records in total. Matching a task tuple is not proof of an otherwise
  controlled experiment. This is not an official submission to the source board.

The O merge uses `tools/merge_o_audits.py` with a private, receipt-bound canonical
export, not the aggregate report or filenames as identities. Every included row
has an exact assignment tuple, canonical result SHA and current approval
fingerprint. Private exports and transport receipts are not distributed here.
`node test.cjs` checks statistics and public-data invariants.
`node test-browser.cjs` runs desktop/mobile checks when Playwright and Chromium
are available.

Original visual confirmed / zero-confirmed counts are represented as lower bounds
within declared coverage. Unknown values are never filled with zero. Budget
self-reports are excluded from objective comparisons. Original statuses and
source SHA-256 values are retained.

## Four-Group Analysis

The fixed analysis uses 40 matching task/variant/seed/scene tuples and excludes
`build_tower` and `push_T` across all four groups. Each of the 26 metrics then
uses its own four-way valid intersection; visual unknowns are not filled with
zero. The detailed analysis route includes all metrics, task outcomes,
event references and an empty-grasp review checklist.

O456's lower confirmed empty-grasp count is explicitly pending a new video
review, not a verified improvement in grasping ability. No new model calls or
video re-audit were performed for this update. Original audit approvals remain
distinct from verification of the site's data import.

`data-verification-20261026-v2.json` binds checks of 164 native outcomes and
4,264 metric values/statuses to approved source exports. Its public snapshot
also distinguishes O456's 36/81 published-batch success rate (44.4%),
11/42 full first round (26.2%), 11/41 approved audits (26.8%) and
11/40 four-group common tasks (27.5%).
The first-round five-capability-equal success rate is a separate 28.3%.

`four-group-analysis.md` and `four-group-analysis.json` are reproducible
descriptive reports, not revised robot outcomes or new audit approvals.

## Sources

- https://na-wen.github.io/robodojo-board/
- https://na-wen.github.io/robodojo-board/api/v1/
- https://zefanw.github.io/robodojo-l3-dashboard/
- Approved first-round Low / High audit snapshot, observed 2026-10-25 03:37 +08:00.

The source datasets, private audit files, sessions, and credentials are not
included. `data.json` is an allowlisted public derivative, not a byte-identical
copy of private audit results. Source hashes identify the preserved originals.
Historical video references stay at their existing public storage locations.

## Reproduce

The site is static and has no backend, tracker, API credentials or runtime CDN.
Open `index.html` locally or serve the directory with a static HTTP server.

```sh
node test.cjs
node tools/analysis_report.cjs
python3 tools/build_dataset.py --approved APPROVED_RESULTS_JSON \
  --index SOURCE_INDEX_JSON --cache PUBLIC_INPUT_DIRECTORY --out .
```

The input cache contains `groups.json`, `runs.json`, `definitions.json`, and
`persistent.json` from the cited public board endpoints. The approved source
directory must retain its original `sources/` tree for SHA verification.

Statistics and CSV downloads use `core.js`. Sample standard deviation uses
`n-1`; quartiles use linear interpolation. There is no synthetic behavior score,
causal significance claim, or estimate of token use, costs, or wall time.
`findings.js` contains reviewed fixed conclusions and a locked four-group
evidence scope. Evidence buttons and nested task links retain that scope even
when display filters select other groups, one task, or confirmed-only values.
Fixed analysis pair summaries use the same four-way metric intersection.
Ordinary selected-group pair columns continue to use their own pair intersection.
Historical groups are excluded from the fixed conclusions.

## Credits

Historical/configuration data and metric definitions: RoboDojo Behavior
Observatory / NA-Wen and the RoboDojo L3 project. Visual design follows the
existing project's quiet research-dashboard conventions; UI code is new.
Lucide 0.468.0 icons are distributed under ISC; see `LUCIDE-LICENSE`.

This prototype does not change or replace the original board.
