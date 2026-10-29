const assert = require("node:assert/strict");
const D = require("./data.json"), C = require("./core.js");
const Findings = require("./current-findings.js");
const A = Findings.analyze(D, C);
assert.equal(A.scope.groups.length, 8);
assert.equal(A.all.score.reduce((n, s) => n + s.n, 0), 336);
assert.deepEqual(A.common.success.map(s => s.n), Array(8).fill(42));
assert.deepEqual(A.common.success.map(s => s.total), [13, 12, 13, 11, 10, 11, 10, 16]);
assert.deepEqual(A.common.empty_retry.map(s => s.total), [32, 42, 41, 16, 46, 24, 39, 34]);
assert.ok(A.common.empty_retry.every(s => s.n === 40));
assert.deepEqual(A.common.drop.map(s => s.total), [19, 27, 31, 34, 32, 28, 28, 32]);
assert.deepEqual(A.common.fine_placement_fail.map(s => s.total), [25, 20, 17, 15, 16, 24, 11, 16]);
assert.ok(A.common.fine_placement_fail.every(s => s.n === 33));
assert.equal(A.references.filter(r => r.score.n).length, 4);
assert.equal(A.references.filter(r => !r.score.n).length, 2);
assert.equal(A.fixed.length, 12);
assert.equal(new Set(A.fixed.map(f => f.id)).size, 12);
const pairs = {
  "o23456,o23456compact": {
    success: [42, 11, 16, 3, 31, 8], score: [42, 14.2, 18.5, 5, 26, 11],
    fine_placement_fail: [38, 26, 16, 7, 28, 3],
    turns: [42, 3160, 2874, 24, 5, 13], actions: [42, 22097, 21603, 19, 1, 22],
    empty_retry: [42, 25, 34, 7, 27, 8], drop: [42, 31, 32, 10, 23, 9],
    collision_arm_object: [42, 5, 11, 1, 34, 7],
  },
  "sixfig,o23456compact": {
    success: [42, 10, 16, 0, 36, 6], score: [42, 12.6, 18.5, 4, 28, 10],
  },
  "o23456,sixfig": {
    fine_placement_fail: [39, 27, 13, 9, 25, 5], empty_retry: [42, 25, 39, 11, 19, 12],
  },
  "o1standard,o1compact": {
    success: [42, 10, 13, 2, 35, 5], score: [42, 13.3, 15.25, 5, 28, 9],
    turns: [42, 2835, 2847, 22, 3, 17], actions: [42, 22530, 24375, 18, 3, 21],
  },
  "o1compact,o456": {
    empty_retry: [42, 41, 17, 13, 24, 5], drop: [42, 31, 35, 6, 26, 10],
    success: [42, 13, 11, 4, 36, 2],
  },
  "o456,o23456": {
    success: [42, 11, 11, 4, 34, 4], score: [42, 13.65, 14.2, 7, 29, 6],
  },
  "low,high": {
    success: [42, 13, 12, 4, 35, 3], score: [42, 15.2, 15.35, 7, 27, 8],
    turns: [42, 2714, 2858, 16, 1, 25],
    view_opposite: [42, 31, 50, 5, 29, 8], view_same: [42, 17, 14, 8, 28, 6],
  },
};
for (const f of A.fixed) {
  assert.equal(f.scope.groups.length, 2);
  assert.equal(f.scope.scope, "common");
  assert.equal(f.scope.policy, "bounds");
  assert.equal(f.scope.includeInterim, false);
  assert.ok(!f.scope.task && !f.scope.variant);
  for (const key of f.fields) {
    const summaries = C.summaries(D, f.scope, key);
    const pair = C.pair(D, f.scope, key, ...f.scope.groups);
    const expected = pairs[f.scope.groups.join(",")][key];
    assert.ok(expected, `${f.id}: missing regression proof for ${key}`);
    const actual = [pair.n, ...summaries.map(s => s.total), pair.less, pair.equal, pair.more];
    actual.forEach((n, i) => assert.ok(Math.abs(n - expected[i]) < 1e-8, `${f.id}: ${key}[${i}]`));
    assert.ok(summaries.every(s => s.n === pair.n));
  }
  for (const task of f.tasks) {
    const rows = C.rowsFor(D, {...f.scope, task});
    assert.equal(rows.length, 2, `${f.id}: ${task}`);
    assert.equal(C.key(rows[0]), C.key(rows[1]));
    assert.deepEqual(new Set(rows.map(r => r.group)), new Set(f.scope.groups));
  }
}
const taskScores = (id, task) => {
  const scope = A.fixed.find(f => f.id === id).scope;
  return scope.groups.map(group => D.runs.find(r => r.group === group && r.task === task).metrics.score.value);
};
for (const task of ["align_blocks", "swap_T"])assert.deepEqual(taskScores("compact-clear-outcomes", task), [0, 1]);
assert.deepEqual(taskScores("compact-clear-outcomes", "pick_from_conveyor_by_image"), [1, 0]);
for (const task of ["fasten_screws", "solve_equation", "press_by_number"])assert.deepEqual(taskScores("compact-depth-success", task), [0, 1]);
assert.deepEqual(taskScores("compact-depth-success", "classify_objects_by_language"), [.4, 0]);
for (const task of ["play_Xylophone", "sort_nesting_dolls_by_size"])assert.deepEqual(taskScores("o1-compact-standard", task), [0, 1]);
assert.deepEqual(taskScores("o1-compact-standard", "pick_from_conveyor_by_image"), [1, 0]);
for (const task of ["push_T", "fold_clothes"])assert.equal(taskScores("clear-complementarity", task)[1], 1);
for (const task of ["stack_bowls", "arrange_largest_number"])assert.equal(taskScores("clear-complementarity", task)[0], 1);
for (const [ids, metric, expected] of [
  [["o23456", "o23456compact"], "empty_retry", [17, 16]],
  [["o23456", "sixfig"], "empty_retry", [17, 17]],
  [["low", "high"], "view_opposite", [15, 12]],
]) {
  assert.deepEqual(C.summaries(D, {...A.scope, groups: ids}, metric).map(s => s.nonzero), expected);
}
assert.deepEqual(Findings.analyze({...D, runs: [...D.runs].reverse()}, C).fixed, A.fixed);
console.log("PASS 12 pair-specific conclusions, exact metric intersections, task examples and stable source scopes");
