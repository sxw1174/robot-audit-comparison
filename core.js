(function (root, factory) {
  const core = factory();
  if (typeof module === "object") module.exports = core;
  else root.AuditCore = core;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  const key = r => JSON.stringify([r.task, r.variant, r.seed, r.scene]);
  const numeric = v => typeof v === "number" && Number.isFinite(v);
  const usable = (m, policy = "bounds") => !!m && numeric(m.value) &&
    (m.status === "confirmed" || (policy === "bounds" && m.status === "lower_bound"));
  const selectedPair = state => state.groups.length === 2 ? [...state.groups] : null;
  function quantile(values, p) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * p, lo = Math.floor(pos);
    return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo);
  }
  function stats(values) {
    const v = values.filter(numeric), n = v.length;
    if (!n) return {n: 0, total: null, mean: null, median: null, sd: null, q1: null, q3: null, min: null, max: null, nonzero: 0};
    const total = v.reduce((a, b) => a + b, 0), mean = total / n;
    return {n, total, mean, median: quantile(v, .5), q1: quantile(v, .25), q3: quantile(v, .75),
      sd: n > 1 ? Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)) : null,
      min: Math.min(...v), max: Math.max(...v), nonzero: v.filter(x => x > 0).length};
  }
  function rowsFor(data, state) {
    return data.runs.filter(r => state.groups.includes(r.group) &&
      (!state.task || r.task === state.task) && (!state.variant || r.variant === state.variant) &&
      (state.includeInterim || r.audit !== "interim"));
  }
  function eligible(data, state, field) {
    let rows = rowsFor(data, state);
    if (state.scope === "common") {
      const sets = state.groups.map(g => new Set(rows.filter(r => r.group === g && usable(r.metrics[field], state.policy)).map(key)));
      rows = rows.filter(r => sets.every(s => s.has(key(r))));
    }
    return rows;
  }
  function summaries(data, state, field) {
    const rows = eligible(data, state, field), raw = rowsFor(data, state);
    return state.groups.map(g => {
      const groupRows = rows.filter(r => r.group === g), vals = groupRows.filter(r => usable(r.metrics[field], state.policy));
      return {...stats(vals.map(r => r.metrics[field].value)), group: g,
        rawN: raw.filter(r => r.group === g).length,
        bounds: vals.filter(r => r.metrics[field].status === "lower_bound").length,
        rows: vals, excluded: raw.filter(r => r.group === g).length - vals.length};
    });
  }
  function pair(data, state, field, a = "low", b = "high") {
    // Pair independently of display scope. Explicit pair labels accompany these results.
    const rows = rowsFor(data, {...state, groups: [a, b]});
    const map = new Map(rows.filter(r => r.group === a).map(r => [key(r), r]));
    const pairs = rows.filter(r => r.group === b).flatMap(r => {
      const left = map.get(key(r));
      if (!left || !usable(left.metrics[field], state.policy) || !usable(r.metrics[field], state.policy)) return [];
      return [{left, right: r, delta: r.metrics[field].value - left.metrics[field].value}];
    });
    return {...stats(pairs.map(p => p.delta)), pairs,
      more: pairs.filter(p => p.delta > 1e-9).length,
      less: pairs.filter(p => p.delta < -1e-9).length,
      equal: pairs.filter(p => Math.abs(p.delta) <= 1e-9).length};
  }
  function csv(rows) {
    return "\uFEFF" + rows.map(row => row.map(v => {
      const s = v == null ? "" : String(v);
      const safe = /^[=+@\-\t\r]/.test(s) ? "'" + s : s;
      return '"' + safe.replaceAll('"', '""') + '"';
    }).join(",")).join("\r\n");
  }
  return {key, numeric, usable, selectedPair, quantile, stats, rowsFor, eligible, summaries, pair, csv};
});
