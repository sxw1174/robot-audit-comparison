const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const C = require("../core.js");
const bytes = fs.readFileSync(path.join(root, "data.json"));
const D = JSON.parse(bytes);
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const ids = ["low", "high", "o1compact", "o456"];
const clean = (value, limit = 1800) => value == null ? "" : String(value).replace(
  /(?:\/Users\/|\/data\/user\/|\/home\/|\/tmp\/|\/private\/)[^\s，。；;"<>]*|(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{15,}/g,
  "[private path omitted]").slice(0, limit);
const identifierRedactions = [];
const base = "https://zefanw.github.io/robodojo-l3-dashboard/api/v1/";
const options = Object.fromEntries(process.argv.slice(2).map(x => {
  const pos = x.indexOf("=");
  assert.ok(pos > 0, "Use --name=value");
  return [x.slice(0, pos), x.slice(pos + 1)];
}));
function receipt(file) {
  const raw = fs.readFileSync(file), j = JSON.parse(raw);
  const returnedBytes = fs.readFileSync(j.receipt);
  assert.equal(sha(returnedBytes), j.receipt_sha256);
  const returned = JSON.parse(returnedBytes);
  assert.equal(returned.returncode, 0);
  assert.deepEqual(JSON.parse(returned.stdout), j.value);
  return {value: j.value, sha256: sha(raw), receipt_sha256: sha(returnedBytes)};
}
function normalize(m) {
  const status = {
    native: "confirmed", confirmed: "lower_bound", zero_confirmed: "lower_bound",
    lower_bound: "lower_bound", lower_bound_with_candidates: "lower_bound",
    self_report_confirmed: "self_report", unavailable: "unknown",
  }[m.status] || "unknown";
  const value = ["unknown", "na", "pending", "self_report"].includes(status)
    ? null : typeof m.value === "boolean" ? Number(m.value) : m.value;
  return {status, value, original_status: m.status};
}
function checkMetrics(r, source) {
  assert.equal(source.result.run_id, r.id);
  for (const k of ["task", "variant", "seed", "scene"]) assert.equal(r[k], source.run[k]);
  assert.equal(source.result.metrics.length, 26);
  for (const m of source.result.metrics) {
    const field = D.metrics[Number(m.id.slice(1)) - 1].key;
    const normalized = normalize(m);
    for (const k of ["value", "status", "original_status"]) {
      assert.deepEqual(r.metrics[field][k], normalized[k], `${r.id} ${field} ${k}`);
    }
  }
  assert.equal(r.events.length, source.result.events.length);
  for (let i = 0; i < r.events.length; i++) {
    const a = r.events[i], b = source.result.events[i];
    assert.equal(a.id, clean(b.event_id));
    if (a.id !== b.event_id) identifierRedactions.push({run_id: r.id, public_event_id: a.id});
    assert.equal(a.status, b.status);
    assert.deepEqual(a.metrics, b.metric_ids.map(x => D.metrics[Number(x.slice(1)) - 1].key));
    assert.deepEqual(a.time, [b.video_start ?? null, b.video_end ?? null]);
    assert.deepEqual(a.decisions, [b.decision_start ?? null, b.decision_end ?? null]);
    assert.deepEqual(a.frames, (b.frame_ids || []).map(x => clean(x, 250)));
  }
}
async function get(name) {
  const response = await fetch(base + name, {signal: AbortSignal.timeout(30000), cache: "no-store"});
  assert.ok(response.ok, `GET ${name}: ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  return {value: JSON.parse(body), sha256: sha(body), url: base + name};
}
async function main() {
  for (const k of ["--lowhigh", "--o", "--out"]) assert.ok(options[k], `${k} required`);
  const lh = receipt(options["--lowhigh"]), o = receipt(options["--o"]);
  assert.equal(o.sha256, D.inputs.find(x => x.name === "approved-o-export").sha256);
  let metricChecks = 0, eventChecks = 0;
  for (const r of D.runs.filter(r => ids.includes(r.group))) {
    const rows = (["low", "high"].includes(r.group) ? lh : o).value.groups[r.group].rows;
    const source = rows.find(x => x.run.run_id === r.id);
    assert.ok(source, r.id);
    checkMetrics(r, source);
    if (["low", "high"].includes(r.group)) {
      const canonical = Buffer.from(source.canonical_base64, "base64");
      assert.equal(sha(canonical), source.approval.result_sha256);
      assert.equal(r.source.analysis_sha256, source.approval.result_sha256);
      assert.deepEqual(JSON.parse(canonical), source.result);
    } else {
      assert.equal(r.source.analysis_sha256, source.analysis_sha256);
      assert.equal(r.source.review_fingerprint, source.fingerprint);
      assert.equal(r.source.assignment_sha256, source.assignment_sha256);
    }
    for (const f of r.source.files) {
      assert.equal(f.sha256, source.source_files[f.kind].sha256);
      assert.equal(f.bytes, source.source_files[f.kind].bytes);
    }
    metricChecks += 26;
    eventChecks += r.events.length;
  }
  const listing = await get("results.json");
  const map = new Map(listing.value.results.map(r => [r.run_id, r]));
  const checks = ids.map(g => {
    const rows = D.runs.filter(r => r.group === g);
    for (const r of rows) {
      const actual = map.get(r.id);
      assert.ok(actual, r.id);
      for (const k of ["task", "variant", "seed", "scene"]) assert.equal(r[k], actual.episode[k]);
      assert.equal(r.metrics.success.value, Number(actual.outcome.success), r.id);
      assert.equal(r.metrics.score.value, actual.outcome.score, r.id);
      assert.equal(actual.outcome.native_terminal, true);
      assert.equal(actual.formal_episode_result, true);
    }
    return {group: g, runs: rows.length, successful_runs: rows.reduce((n, r) => n + r.metrics.success.value, 0),
      score_total: rows.reduce((n, r) => n + r.metrics.score.value, 0), mismatches: 0};
  });
  const experiment = await get("experiments/" + D.groups.find(g => g.id === "o456").experiment_id + ".json");
  assert.equal(experiment.value.snapshot_id, listing.value.snapshot_id, "Public snapshot changed; retry read-only");
  const e = experiment.value, batch = e.experiment.batch_statistics, first = e.evaluation_scores.first_round;
  const firstRows = first.selected_run_ids.map(id => map.get(id));
  assert.equal(firstRows.length, 42);
  const batchRows = e.experiment.run_ids.map(id => map.get(id));
  const sumSuccess = rows => rows.reduce((n, r) => n + Number(r.outcome.success), 0);
  assert.equal(sumSuccess(batchRows), batch.successful_runs);
  assert.equal(batchRows.length, batch.success_count);
  const extra = batchRows.filter(r => !first.selected_run_ids.includes(r.run_id));
  const groups = ids.map(g => new Set(D.runs.filter(r => r.group === g).map(C.key)));
  const common = [...groups[0]].filter(k => groups.every(s => s.has(k)));
  const auditRows = D.runs.filter(r => r.group === "o456");
  assert.ok(auditRows.every(r => first.selected_run_ids.includes(r.id)));
  const commonRows = auditRows.filter(r => common.includes(C.key(r)));
  const report = {
    schema_version: "four-group-data-verification-v1", verified_at: new Date().toISOString(),
    data_sha256: sha(bytes), audit_sources: [lh, o].map(x => ({sha256: x.sha256, receipt_sha256: x.receipt_sha256})),
    source_metrics_checked: metricChecks, source_events_checked: eventChecks, public_native_checks: checks,
    source_metric_mismatches: 0, source_event_mismatches: 0,
    source_event_identifier_redactions: identifierRedactions,
    public_snapshot_id: listing.value.snapshot_id,
    public_inputs: [listing, experiment].map(x => ({url: x.url, sha256: x.sha256})),
    o456_scope_reconciliation: {
      published_batch: {n: batchRows.length, success: sumSuccess(batchRows), rate: batch.success_rate, mean_score: batch.score_mean},
      first_round: {n: firstRows.length, success: sumSuccess(firstRows), rate: sumSuccess(firstRows) / firstRows.length,
        mean_score: firstRows.reduce((n, r) => n + r.outcome.score, 0) / firstRows.length,
        five_capability_equal_rate: first.success_rate, five_capability_equal_score: first.score,
        at_decision_limit: firstRows.filter(r => r.outcome.model_decisions >= 100).map(r => ({
          run_id: r.run_id, task: r.episode.task, decisions: r.outcome.model_decisions, success: r.outcome.success,
        }))},
      approved_audits: {n: auditRows.length, success: sumSuccess(auditRows.map(r => map.get(r.id))), rate: checks[3].successful_runs / auditRows.length},
      four_group_common: {n: commonRows.length, success: sumSuccess(commonRows.map(r => map.get(r.id))), rate: 11 / commonRows.length},
      additional_published_devset: {n: extra.length, success: sumSuccess(extra)},
      omitted_first_round: firstRows.filter(x => !auditRows.some(r => r.id === x.run_id)).map(x => ({
        run_id: x.run_id, episode: x.episode, success: x.outcome.success, score: x.outcome.score,
      })),
    },
    limits: [
      "Import integrity and public native outcomes verified; no new visual re-audit or model call.",
      "Original unknowns and confirmation lower bounds preserved; not proof of exhaustive event detection.",
      "Published batch is 81 observed results, not complete P50_111 acceptance.",
    ],
  };
  fs.writeFileSync(options["--out"], JSON.stringify(report, null, 2) + "\n", {flag: "wx"});
  console.log(JSON.stringify(report, null, 2));
}
main().catch(e => {console.error(e.message); process.exitCode = 1;});
