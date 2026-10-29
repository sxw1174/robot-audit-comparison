# RoboDojo Behavior Comparison

An independent, read-only research preview of first-round behavior audits.
Low, High, O1 Compact, O456 Clear, O1 Standard, O23456 Clear,
O23456 Compact and O23456 DepthPro 6fig CUDA are the groups analyzed in
this round.
Historical and interim groups imported from the public behavior board remain
ordinary selectable reference groups and are labeled by source. The overview
keeps five evidence-linked findings covering the current eight analyzed groups,
four imported reference groups and two interim groups. The eight-way native
outcome intersection has 42 task tuples; each behavioral metric uses its own
valid intersection. Selected groups control the statistics, distributions, task tables and
event evidence below, but never rewrite the conclusions.

**Preview:** https://sxw1174.github.io/robot-audit-comparison/

## Scope

- Low: 42 approved analyses. High: 42 approved analyses, including the
  subscription-analyzed `push_T` supplement. Final combined-batch acceptance
  remains separate from per-sample approval.
- O1 Compact: 42/42 program-valid, currently review-approved analyses.
  `build_tower` and `push_T` were completed using the server subscription.
- O456 Clear: 42/42 program-valid, currently review-approved analyses.
  The missing `push_T` was completed using the server subscription.
- O1 Standard: 42/42 program-valid, currently review-approved analyses.
  Its profile is `persistent-cap20-o1`, not O1 Compact. The missing `push_T`
  was completed using the server subscription; no placeholder metrics are used.
- O23456 Clear: 42/42 published (40 approved, two program-complete);
  O23456 DepthPro 6fig CUDA: 42/42 approved.
  The final three DepthPro samples used the server subscription for analysis
  and the relay for final acceptance of that three-sample supplement.
  The combined original 42-sample batch acceptance is recorded separately.
  The two subscription supplements passed original collect validation.
  Their Main calls failed due to transport timeout and workspace routing errors;
  no approval or review counter was changed.
- O23456 Compact: 42/42 published (38 relay-approved, four subscription
  program-complete). All 42 official source records are now available.
  `store_tools_in_toolbox` completed in its original subscription session and
  passed the original validator. Main approved an earlier fingerprint; the
  current fingerprint differs. Both fingerprints are preserved without
  claiming current approval.
- The human explicitly authorized publishing and counting all six
  program-complete supplements together with approved rows. They are not
  marked interim or excluded by the interim toggle. Their actual Main failures
  remain in source metadata; evidence fingerprints are not labeled approval
  fingerprints. Combined batch acceptance remains separate. Robot model:
  gpt-6-astra medium; audit/review model: gpt-6.1-sol medium.
- Historical Medium: 42 published runs, with 25 Sim5.1 and 17 Sim6 records.
- Five other published groups are available as separate configuration references.
- O23 Compact and O23 DepthPro remain explicitly marked interim.
- 588 run records in total. Matching a task tuple is not proof of an otherwise
  controlled experiment. This is not an official submission to the source board.

The O merge uses `tools/merge_o_audits.py` with a private, receipt-bound canonical
export, not the aggregate report or filenames as identities. Every approved row
has an exact assignment tuple, canonical result SHA and current approval
fingerprint. Private exports and transport receipts are not distributed here.
The explicit program-complete publication uses `tools/merge_program_audits.py`;
`data-verification-20261029-program5.json` binds five additions, 130 metrics
and 41 events while preserving all 582 existing public rows exactly.
It explicitly records that Main approval was not obtained. The existing
approved-only importer and its validators remain unchanged.
The final Compact addition uses `tools/merge_final_compact.py`;
`data-verification-20261030-compact42.json` binds 26 metrics and 16 events,
preserves all 587 previous public rows and records the approval-fingerprint
mismatch. All eight analyzed groups now contain 42 results, with 336 total
analyses and no missing records. Unknown metrics remain null.
The O1 Standard addition preserves every one of the original 416 records.
The October 29 addition preserves all 457 prior public records and adds 76
canonical approved records. `data-verification-20261029-completion.json`
binds the additive snapshot, 1,976 new metrics and 452 event records.
`data-verification-20261029-sixfig42.json` binds three further DepthPro
samples, 78 metrics and 25 events while preserving all 533 prior records.
`data-verification-20261029-high42.json` binds the High supplement's 26 metrics
and five events while preserving all 536 prior public records.
`data-verification-20261029-o45642-clear38.json` binds two further subscription
supplements and their 52 metrics while preserving all 537 prior records.
`data-verification-20261029-o1standard42.json` binds the O1 Standard supplement
and its 26 metrics while preserving all 539 prior records.
`data-verification-20261029-o1compact42.json` binds the two O1 Compact
supplements, 52 metrics and 16 events while preserving all 540 prior records.
`data-verification-20261029-clear40.json` binds two further O23456 Clear
supplements, 52 metrics and five events while preserving all 542 prior records.
`data-verification-20261029-compact38.json` binds 38 O23456 Compact relay
analyses, 988 metrics and 211 events while preserving all 544 prior records.
Its export records the three pending available cases and the one official
source-absent case without filling either gap with placeholder metrics.
The detailed four-group analysis remains locked to its original 40 task tuples
as an explicitly separate report. It is no longer the overview's main conclusion.
The overview's `current-findings.js` uses all current published records without
changing raw results or approvals. Scores are task-weighted, not capability-weighted.
`tools/verify_o1_standard.py` binds its 1,066 metric values/statuses, 304 event
identities/locations and 41 original native outcomes to current approved source
results. The independent export observed no active owners and performed no model
calls or remote writes.
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
event references and empty-grasp source evidence notes.
O1 Standard is selectable in the statistics, task, event and configuration views,
but is not silently added to the existing four-group findings or report.

O456's lower confirmed empty-grasp count describes the original coverage,
not a verified improvement in grasping ability. No new model calls or
video re-audit were performed for this update. Original audit approvals remain
distinct from verification of the site's data import.

`data-verification-20261026-v2.json` binds checks of 164 native outcomes and
4,264 metric values/statuses to approved source exports. Its public snapshot
also distinguishes O456's 36/81 published-batch success rate (44.4%),
11/42 full first round (26.2%), 11/41 approved audits (26.8%) and
11/40 four-group common tasks (27.5%).
The first-round five-capability-equal success rate is a separate 28.3%.
The immutable original verification record is retained;
`data-verification-20261026-o1-standard.json` binds the current additive snapshot
and reuses the original four-group verification without claiming a new video audit.

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

For the additive O1 Standard import, use its private receipt-bound export:

```sh
python3 tools/merge_o_audits.py --base data.json --export APPROVED_O1_STANDARD_EXPORT --out data.json
python3 tools/verify_o1_standard.py --export APPROVED_O1_STANDARD_EXPORT \
  --previous-revision 083480d --out data-verification-20261026-o1-standard.json
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
