(function (root, factory) {
  if (typeof module === "object") module.exports = factory();
  else root.CurrentFindings = factory();
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  function analyze(data, core) {
    const groups = data.groups.filter(g => g.source === "本批批准分析").map(g => g.id);
    const scope = {groups, scope: "common", policy: "bounds", includeInterim: false};
    const summaries = mode => Object.fromEntries(data.metrics.map(m => [m.key,
      core.summaries(data, {...scope, scope: mode}, m.key)]));
    const common = summaries("common"), all = summaries("all");
    const references = data.groups.filter(g => !groups.includes(g.id)).map(g => {
      const state = {...scope, groups: [g.id], scope: "all"};
      return {group: g.id, source: g.source, rows: data.runs.filter(r => r.group === g.id).length,
        success: core.summaries(data, state, "success")[0], score: core.summaries(data, state, "score")[0]};
    });
    const fixed = [
      {id: "current-outcomes", title: "O23456 Compact在现有样本及共同任务上领先",
        text: "Compact已获批38/42项：成功16项（42.1%）、任务等权均分47.2%。8组共同37项中，它成功率43.2%、均分47.2%，其余7组分别为27.0%–35.1%、32.8%–40.0%。缺项尚未补齐，不视为完整42项最终成绩。",
        fields: ["success", "score"]},
      {id: "current-complete", title: "完整42项组中，没有配置同时独占成功率和均分第一",
        text: "Low、High、O1 Compact、O456 Clear、O1 Standard、DepthPro 6fig CUDA的成功项为13 / 12 / 13 / 11 / 10 / 10，任务均分为36.2% / 36.5% / 36.3% / 32.5% / 31.7% / 30.0%。Low与O1 Compact成功率并列最高，High均分略高；这些差异不是显著性结论。",
        fields: ["success", "score"]},
      {id: "current-grasp", title: "O456 Clear空夹较少，但掉落与整体得分没有同步改善",
        text: "8组共同有效35项中，O456确认空夹9次，为8组最少；掉落25次，仅低于O23456 Compact的26次。共同37项任务均分为35.9%，低于Low、High、O1 Compact和O23456 Compact。空夹次数不能替代夹取成功率或整体完成度。",
        fields: ["empty_retry", "drop", "score"]},
      {id: "current-depth", title: "DepthPro 6fig的精细放置失败较少，不代表任务得分更高",
        text: "8组共同有效28项中，DepthPro 6fig CUDA确认精细放置失败7次，为8组最少；O456为8次，O23456 Clear为18次。共同37项任务上，DepthPro均分32.8%，低于Clear的36.9%和Compact的47.2%。尝试机会与审核覆盖不同，不据此推断深度来源的因果效果。",
        fields: ["fine_placement_fail", "score"]},
      {id: "current-coverage", title: "Clear与Compact仍有缺项，外部参考与阶段性结果单独保留",
        text: "8组已收录330项：6组各42项，O23456 Clear为40/42，O23456 Compact为38/42。Compact现有审核确认空夹30次、掉落26次、精细放置失败12次（有效37项）；均为覆盖内下界。另4组外部完整参考共168项，2组阶段性结果共84项，不冒充我们补分析的结果，也不混入8组排名。",
        fields: ["empty_retry", "drop", "fine_placement_fail"]},
    ];
    return {scope, all, common, references, fixed};
  }
  return {analyze};
});
