const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
const D = JSON.parse(fs.readFileSync("data.json", "utf8"));
const proof = require("./data-verification-20261105-server79.json");

const ids = [
  "server-persistent-cap20-r1-20261104",
  "server-persistent-cap20-r2-20261104",
];
assert.equal(proof.previous_runs, 630);
assert.equal(proof.added_runs, 79);
assert.equal(D.runs.length, 709);
assert.equal(D.missing.length, 0);
for (const [id, expected] of [
  [ids[0], {rows: 40, needs_attention: 1, paused: 0, skipped: 1}],
  [ids[1], {rows: 39, needs_attention: 2, paused: 1, skipped: 0}],
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
console.log("PASS server R1/R2 dashboard upload validation");
