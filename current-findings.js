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
        text: "Compact已收录41/42项：成功16项（39.0%）、任务等权均分44.5%。8组共同41项中，它成功率39.0%、均分44.5%，其余7组分别为24.4%–31.7%、30.7%–37.4%。最后一项仍在分析，不视为完整42项最终成绩；补分析的原复核状态保留在来源中。",
        fields: ["success", "score"]},
      {id: "current-complete", title: "完整42项组中，没有配置同时独占成功率和均分第一",
        text: "Low、High、O1 Compact、O456 Clear、O1 Standard、O23456 Clear、DepthPro 6fig CUDA的成功项为13 / 12 / 13 / 11 / 10 / 11 / 10，任务均分为36.2% / 36.5% / 36.3% / 32.5% / 31.7% / 33.8% / 30.0%。Low与O1 Compact成功率并列最高，High均分略高；这些差异不是显著性结论。",
        fields: ["success", "score"]},
      {id: "current-grasp", title: "O456 Clear空夹较少，但掉落与整体得分没有同步改善",
        text: "8组共同有效39项中，O456确认空夹16次，为8组最少；掉落29次，为8组最多。共同41项任务均分为33.3%，低于Low、High、O1 Compact、O23456 Clear和O23456 Compact。空夹次数不能替代夹取成功率或整体完成度。",
        fields: ["empty_retry", "drop", "score"]},
      {id: "current-depth", title: "DepthPro 6fig的精细放置失败较少，不代表任务得分更高",
        text: "8组共同有效32项中，DepthPro 6fig CUDA确认精细放置失败11次，为8组最少；O456为12次，O23456 Clear为24次。共同41项任务上，DepthPro均分30.7%，低于Clear的34.6%和Compact的44.5%。尝试机会与审核覆盖不同，不据此推断深度来源的因果效果。",
        fields: ["fine_placement_fail", "score"]},
      {id: "current-coverage", title: "Clear已收录42项，Compact最后一项继续分析",
        text: "8组已收录335项：7组各42项，O23456 Compact为41/42。Compact现有分析确认空夹32次、掉落27次、精细放置失败16次（有效40项）；均为覆盖内下界。5项补分析统一纳入统计，但Main因网络失败未批准，原状态不改写。另4组外部完整参考共168项，2组阶段性结果共84项，不混入8组排名。",
        fields: ["empty_retry", "drop", "fine_placement_fail"]},
    ];
    return {scope, all, common, references, fixed};
  }
  return {analyze};
});
