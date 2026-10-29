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
      {id: "current-outcomes", title: "O23456 Compact首轮42项的成功率和均分最高",
        text: "Compact已收录42/42项：成功16项（38.1%）、任务等权均分44.0%。8组共同42项中，其余7组成功率为23.8%–31.0%、均分为30.0%–36.5%。这是单次首轮的描述性比较，不是因果或显著性结论；补分析的原复核状态保留在来源中。",
        fields: ["success", "score"]},
      {id: "current-complete", title: "其余七组的成功率与均分排序不一致",
        text: "Low、High、O1 Compact、O456 Clear、O1 Standard、O23456 Clear、DepthPro 6fig CUDA的成功项为13 / 12 / 13 / 11 / 10 / 11 / 10，任务均分为36.2% / 36.5% / 36.3% / 32.5% / 31.7% / 33.8% / 30.0%。Low与O1 Compact成功率并列最高，High均分略高；这些差异不是显著性结论。",
        fields: ["success", "score"]},
      {id: "current-grasp", title: "O456 Clear空夹较少，但掉落与整体得分没有同步改善",
        text: "8组共同有效40项中，O456确认空夹16次，为8组最少；掉落34次，为8组最多。共同42项任务均分为32.5%，低于Low、High、O1 Compact、O23456 Clear和O23456 Compact。空夹次数不能替代夹取成功率或整体完成度。",
        fields: ["empty_retry", "drop", "score"]},
      {id: "current-depth", title: "DepthPro 6fig的精细放置失败较少，不代表任务得分更高",
        text: "8组共同有效33项中，DepthPro 6fig CUDA确认精细放置失败11次，为8组最少；O456为15次，O23456 Clear为24次。共同42项任务上，DepthPro均分30.0%，低于Clear的33.8%和Compact的44.0%。尝试机会与审核覆盖不同，不据此推断深度来源的因果效果。",
        fields: ["fine_placement_fail", "score"]},
      {id: "current-coverage", title: "八组均已收录42项分析，原复核状态分别保留",
        text: "8组已收录336项，各42项。Compact分析确认空夹34次、掉落32次、精细放置失败16次（有效41项）；均为覆盖内下界。6项程序完成补分析统一纳入统计：5项Main网络失败，1项当前指纹与旧批准记录不一致，不冒称复核通过。另4组外部完整参考共168项，2组阶段性结果共84项，不混入8组排名。",
        fields: ["empty_retry", "drop", "fine_placement_fail"]},
    ];
    return {scope, all, common, references, fixed};
  }
  return {analyze};
});
