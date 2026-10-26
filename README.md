# RoboDojo Behavior Comparison

An independent, read-only research preview of first-round behavior audits.
Low, High, O1 Compact, O456 Clear and historical configurations are ordinary
selectable groups. The overview keeps six fixed, evidence-linked findings from
the reviewed Low / High first round; selected groups control the statistics,
distributions, task tables and event evidence below.

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
python3 tools/build_dataset.py --approved APPROVED_RESULTS_JSON \
  --index SOURCE_INDEX_JSON --cache PUBLIC_INPUT_DIRECTORY --out .
```

The input cache contains `groups.json`, `runs.json`, `definitions.json`, and
`persistent.json` from the cited public board endpoints. The approved source
directory must retain its original `sources/` tree for SHA verification.

Statistics and CSV downloads use `core.js`. Sample standard deviation uses
`n-1`; quartiles use linear interpolation. There is no synthetic behavior score,
causal significance claim, or estimate of token use, costs, or wall time.
`findings.js` recomputes conclusions from the current task, variant and evidence
filters using the named pair's metric-specific intersection. Evidence buttons
open that exact paired scope even when additional groups are selected. Empty
intersections produce no conclusions. External groups are excluded by default.

## Credits

Historical/configuration data and metric definitions: RoboDojo Behavior
Observatory / NA-Wen and the RoboDojo L3 project. Visual design follows the
existing project's quiet research-dashboard conventions; UI code is new.
Lucide 0.468.0 icons are distributed under ISC; see `LUCIDE-LICENSE`.

This prototype does not change or replace the original board.
