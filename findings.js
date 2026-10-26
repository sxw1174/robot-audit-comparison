(function (root, factory) {
  if (typeof module === "object") module.exports = factory();
  else root.AuditFindings = factory();
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  const scope = Object.freeze({
    groups: Object.freeze(["low", "high"]), scope: "common", policy: "bounds",
    task: "", variant: "", includeInterim: false,
  });
  // Editorial snapshot. New findings require explicit evidence review, not a filter change.
  const findings = [
    {
      id: "outcomes",
      title: "本轮High成功率未高于Low，平均得分接近",
      text: "41对任务中，Low成功12项（29.27%），High成功11项（26.83%）。平均得分0.3463与0.3500，相差0.0037；High得分提高8项、降低7项、持平26项。",
      fields: ["success", "score"],
      evidence: {success: [41, 12, 11], score: [41, 14.2, 14.35]},
    },
    {
      id: "distribution",
      title: "High零分任务更少，部分得分任务更多",
      text: "固定41对中，Low → High：零分21 → 17项，部分得分8 → 13项，满分12 → 11项。部分得分指0 < score < 1；满分与原生成功标记分开统计。",
      fields: ["score"], evidence: {score: [41, 14.2, 14.35]},
    },
    {
      id: "effort",
      title: "High使用更多决策轮数和环境控制步",
      text: "41对任务中，决策总数2653 → 2784轮，增加4.94%；实际环境控制22981 → 24506步，增加6.64%。这些数值不代表token、费用或运行耗时。",
      fields: ["turns", "actions"],
      evidence: {turns: [41, 2653, 2784], actions: [41, 22981, 24506]},
    },
    {
      id: "view",
      title: "High异侧手臂补视野的确认计数更多",
      text: "41对任务中，Low确认28次、High确认47次。High更多8项、更少5项、相同28项，差异集中在13项任务中；计数为已核查覆盖内的确认下界。",
      fields: ["view_opposite"], evidence: {view_opposite: [41, 28, 47]},
    },
    {
      id: "grasp",
      title: "High空夹和夹取掉落的确认计数更多",
      text: "39对有效任务中，空夹32 → 42次，夹取掉落19 → 27次。两项为覆盖范围内的确认计数，不是完整失败率，也不与其他失误事件直接相加。",
      fields: ["empty_retry", "drop"],
      evidence: {empty_retry: [39, 32, 42], drop: [39, 19, 27]},
    },
    {
      id: "placement",
      title: "High精细放置失败的确认计数更少",
      text: "36对有效任务中，Low确认26次、High确认22次；逐任务减少9项、增加5项、相同22项。该项与夹取失误分开统计，未知项不填零。",
      fields: ["fine_placement_fail"], evidence: {fine_placement_fail: [36, 26, 22]},
    },
  ].map(row => Object.freeze({
    ...row, fields: Object.freeze(row.fields), ids: scope.groups, scope,
  }));
  return {fixed: Object.freeze(findings), scope};
});
