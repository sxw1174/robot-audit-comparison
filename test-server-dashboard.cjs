const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
const D = JSON.parse(fs.readFileSync("data.json", "utf8"));
const proof = require("./data-verification-20261105-server82.json");
const r4EefProof = require("./data-verification-20261106-server-r4-eef.json");

const ids = [
  "server-persistent-cap20-r1-20261104",
  "server-persistent-cap20-r2-20261104",
];
assert.equal(proof.previous_runs, 713);
assert.equal(proof.added_runs, 1);
assert.equal(D.runs.length, r4EefProof.current_runs);
assert.equal(D.missing.length, 0);
for (const [id, expected] of [
  [ids[0], {rows: 42, needs_attention: 0, paused: 0, skipped: 0}],
  [ids[1], {rows: 42, needs_attention: 0, paused: 0, skipped: 0}],
]) {
  const group = D.groups.find(g => g.id === id);
  const rows = D.runs.filter(r => r.group === id);
  assert.ok(group);
  assert.equal(group.source, "本批服务器分析");
  assert.equal(group.audit, "complete");
  assert.equal(rows.length, expected.rows);
  assert.equal(group.completed, expected.rows);
  assert.equal(group.needs_attention, expected.needs_attention);
  assert.equal(group.paused, expected.paused);
  assert.equal(group.skipped, expected.skipped);
  assert.ok(rows.every(r => r.audit === "complete"));
  assert.ok(rows.every(r => r.seed === 0 && r.scene === 0));
  assert.ok(rows.every(r => Object.keys(r.metrics).length === 26));
  assert.ok(rows.every(r => r.source.access === "server_analysis"));
  assert.deepEqual(C.summaries(D, {
    groups: [id], scope: "all", policy: "bounds", task: "", variant: "",
    includeInterim: false,
  }, "score").map(s => s.n), [expected.rows]);
}
assert.ok(!D.runs.some(r => /devset/i.test(JSON.stringify(r))));
assert.ok(!JSON.stringify(D).includes("/data/user/"));

const r4EefIds = [
  "server-rsi-semantic-eef-20261104",
  "server-eef-relative-medium-20261105",
];
assert.equal(r4EefProof.previous_runs, 714);
assert.equal(r4EefProof.added_runs, 84);
assert.equal(r4EefProof.current_runs, 798);
assert.equal(D.runs.length, r4EefProof.current_runs);
for (const id of r4EefIds) {
  const group = D.groups.find(g => g.id === id);
  const rows = D.runs.filter(r => r.group === id);
  assert.ok(group);
  assert.equal(group.source, "本批服务器分析");
  assert.equal(group.audit, "complete");
  assert.equal(group.batch_complete, true);
  assert.equal(group.completed, 42);
  assert.equal(group.needs_attention, 0);
  assert.equal(group.paused, 0);
  assert.equal(group.skipped, 0);
  assert.equal(group.review_pending, 0);
  assert.equal(rows.length, 42);
  assert.ok(rows.every(r => r.audit === "approved"));
  assert.ok(rows.every(r => r.source.review_status === "approved"));
  assert.ok(rows.every(r => r.source.program_validated === true));
  assert.ok(rows.every(r => r.seed === 0 && r.scene === 0));
  assert.ok(rows.every(r => Object.keys(r.metrics).length === 26));
  assert.deepEqual(C.summaries(D, {
    groups: [id], scope: "all", policy: "bounds", task: "", variant: "",
    includeInterim: false,
  }, "score").map(s => s.n), [42]);
}
console.log("PASS server R1/R2/R4/EEF dashboard upload validation");
