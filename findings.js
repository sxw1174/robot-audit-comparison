(function (root, factory) {
  if (typeof module === "object") module.exports = factory(require("./core.js"));
  else root.AuditFindings = factory(root.AuditCore);
})(typeof window === "undefined" ? globalThis : window, function (C) {
  "use strict";
  const fmt = (v, digits = 2) => v.toLocaleString("zh-CN", {maximumFractionDigits: digits});
  const direction = (v, up = "增加", down = "减少") => v > 1e-9 ? up : v < -1e-9 ? down : "不变";
  const change = (v, digits = 2) => Math.abs(v) < 1e-9 ? "不变" : direction(v) + fmt(Math.abs(v), digits);
  function summarize(data, state, field, ids) {
    const p = C.pair(data, state, field, ...ids);
    const values = side => p.pairs.map(row => row[side].metrics[field].value);
    const bins = vals => ({
      zero: vals.filter(v => v === 0).length,
      partial: vals.filter(v => v > 0 && v < 1).length,
      full: vals.filter(v => v === 1).length,
    });
    return {...p, left: C.stats(values("left")), right: C.stats(values("right")),
      leftBins: bins(values("left")), rightBins: bins(values("right"))};
  }
  function build(data, state, ids) {
    if (!ids || ids.length !== 2) return [];
    const names = ids.map(id => data.groups.find(g => g.id === id).name);
    const [a, b] = names, out = [];
    const get = field => summarize(data, state, field, ids);
    const add = (id, title, text, fields) => out.push({id, title, text, fields, ids});
    const success = get("success"), score = get("score");
    if (success.n && score.n) {
      const title = success.mean <= 0 && Math.abs(score.mean) < .01 && score.n > 1
        ? `${b}未提高成功率，平均得分接近${a}`
        : `${b}成功率${change(success.mean * 100)}${Math.abs(success.mean) > 1e-9 ? "个百分点" : ""}`;
      add("outcomes", title,
        `成功率：${a} ${fmt(success.left.mean * 100)}%（${success.left.total}/${success.n}），${b} ${fmt(success.right.mean * 100)}%（${success.right.total}/${success.n}）。`
        + `平均得分：${fmt(score.left.mean, 4)} → ${fmt(score.right.mean, 4)}，${change(score.mean, 4)}（${score.n}对）。`
        + `得分提高${score.more}项、降低${score.less}项、持平${score.equal}项。`,
        ["success", "score"]);
    }
    if (score.n) {
      const l = score.leftBins, r = score.rightBins;
      add("distribution",
        r.zero < l.zero && r.partial > l.partial
          ? `${b}零分任务减少，部分完成任务增加`
          : `${b}零分任务${change(r.zero - l.zero)}${r.zero !== l.zero ? "项" : ""}`,
        `${score.n}对任务，${a} → ${b}：零分${l.zero} → ${r.zero}项，部分得分${l.partial} → ${r.partial}项，满分${l.full} → ${r.full}项。`
        + "部分得分指0 < score < 1；满分与原生成功标记分别统计。",
        ["score"]);
    }
    const turns = get("turns"), actions = get("actions");
    if (turns.n && actions.n) {
      const relative = p => p.left.total > 0 ? `（${change((p.right.total / p.left.total - 1) * 100)}%）` : "";
      add("effort",
        turns.mean > 0 && actions.mean > 0
          ? `${b}使用更多决策轮数和环境控制步`
          : `${b}决策轮数${direction(turns.mean)}，控制步${direction(actions.mean)}`,
        `决策共${fmt(turns.left.total)} → ${fmt(turns.right.total)}轮${relative(turns)}，每任务均值${fmt(turns.left.mean)} → ${fmt(turns.right.mean)}（${turns.n}对）。`
        + `控制共${fmt(actions.left.total)} → ${fmt(actions.right.total)}步${relative(actions)}，均值${fmt(actions.left.mean)} → ${fmt(actions.right.mean)}（${actions.n}对）。`
        + "这些记录不代表token或运行耗时。",
        ["turns", "actions"]);
    }
    const view = get("view_opposite");
    if (view.n) {
      add("view", `${b}异侧手臂补视野确认计数${direction(view.mean)}`,
        `${a} ${fmt(view.left.total)}次，${b} ${fmt(view.right.total)}次（${view.n}对）。`
        + `${b}计数更多${view.more}项、更少${view.less}项、相同${view.equal}项；差异集中在${view.more + view.less}项任务中。`,
        ["view_opposite"]);
    }
    const empty = get("empty_retry"), drop = get("drop");
    if (empty.n && drop.n) {
      add("grasp",
        empty.mean > 0 && drop.mean > 0
          ? `${b}空夹和掉落的确认计数更高`
          : `${b}空夹计数${direction(empty.mean)}，掉落计数${direction(drop.mean)}`,
        `空夹：${a} ${fmt(empty.left.total)} → ${b} ${fmt(empty.right.total)}次（${empty.n}对）；`
        + `夹取掉落：${fmt(drop.left.total)} → ${fmt(drop.right.total)}次（${drop.n}对）。`
        + "这是覆盖范围内确认事件的计数，不是完整失败率。",
        ["empty_retry", "drop"]);
    }
    const placement = get("fine_placement_fail");
    if (placement.n) {
      add("placement", `${b}精细放置失败的确认计数${direction(placement.mean)}`,
        `${a} ${fmt(placement.left.total)}次，${b} ${fmt(placement.right.total)}次（${placement.n}对）。`
        + `逐任务减少${placement.less}项、增加${placement.more}项、相同${placement.equal}项；`
        + "该项计数与夹取失误分开统计。",
        ["fine_placement_fail"]);
    }
    return out;
  }
  return {build, summarize};
});
