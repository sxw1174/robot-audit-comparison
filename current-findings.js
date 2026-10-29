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
    const percent = value => (value * 100).toFixed(1);
    const number = value => value.toFixed(1);
    const comparisons = {};
    function comparison(ids) {
      const key = ids.join(",");
      if (!comparisons[key]) {
        const pairScope = {...scope, groups: ids};
        comparisons[key] = {
          scope: pairScope,
          metrics: Object.fromEntries(data.metrics.map(m =>
            [m.key, core.summaries(data, pairScope, m.key)])),
          pairs: Object.fromEntries(data.metrics.map(m =>
            [m.key, core.pair(data, pairScope, m.key, ...ids)])),
        };
      }
      return comparisons[key];
    }
    function finding(id, ids, fields, describe, tasks = []) {
      const proof = comparison(ids);
      return {id, scope: proof.scope, fields, tasks, ...describe(proof)};
    }
    const fixed = [
      finding("compact-clear-outcomes", ["o23456", "o23456compact"], ["success", "score"],
        ({metrics: m, pairs: p}) => ({
          title: `O23456 Compact比Clear多成功${m.success[1].total - m.success[0].total}项，但有反向退步`,
          text: `${p.success.n}个共同任务中，Clear与Compact分别成功${m.success[0].total}、${m.success[1].total}项，任务均分为${percent(m.score[0].mean)}%、${percent(m.score[1].mean)}%。Compact把${p.success.more}项Clear未成功任务做成功，也失去了${p.success.less}项Clear成功任务；得分提高${p.score.more}项、降低${p.score.less}项、持平${p.score.equal}项。align_blocks与swap_T由0分升至1分，pick_from_conveyor_by_image由1分降至0分。`,
        }), ["align_blocks", "swap_T", "pick_from_conveyor_by_image"]),
      finding("compact-clear-placement", ["o23456", "o23456compact"], ["fine_placement_fail"],
        ({metrics: m, pairs: p}) => ({
          title: "Compact的精细放置失败少于Clear，差异集中在少数任务",
          text: `两组共同有效${p.fine_placement_fail.n}项中，Clear确认精细放置失败${m.fine_placement_fail[0].total}次，Compact为${m.fine_placement_fail[1].total}次，少${m.fine_placement_fail[0].total - m.fine_placement_fail[1].total}次。逐任务看，Compact减少${p.fine_placement_fail.less}项、增加${p.fine_placement_fail.more}项、相同${p.fine_placement_fail.equal}项。这里比较确认次数，不是按放置尝试数归一化的失败率。`,
        })),
      finding("compact-clear-steps", ["o23456", "o23456compact"], ["turns", "actions"],
        ({metrics: m, pairs: p}) => ({
          title: "Compact相对Clear的决策轮数普遍减少，控制步却不一致",
          text: `${p.turns.n}项任务中，平均决策轮数从Clear的${number(m.turns[0].mean)}降至Compact的${number(m.turns[1].mean)}，其中${p.turns.less}项减少、${p.turns.more}项增加、${p.turns.equal}项相同。平均控制步从${number(m.actions[0].mean)}降至${number(m.actions[1].mean)}，但逐任务仅${p.actions.less}项减少、${p.actions.more}项增加。较少决策不等于每个任务都执行了更少动作。`,
        })),
      finding("compact-clear-errors", ["o23456", "o23456compact"],
        ["empty_retry", "drop", "collision_arm_object"],
        ({metrics: m, pairs: p}) => ({
          title: "Compact相对Clear并没有同时减少空夹、掉落和碰撞",
          text: `在${p.empty_retry.n}项共同任务上，Clear与Compact的确认空夹分别为${m.empty_retry[0].total}、${m.empty_retry[1].total}次，掉落为${m.drop[0].total}、${m.drop[1].total}次，手臂与物体异常碰撞为${m.collision_arm_object[0].total}、${m.collision_arm_object[1].total}次。Compact的空夹发生在${m.empty_retry[1].nonzero}项任务中，Clear为${m.empty_retry[0].nonzero}项：总次数更多，不代表受影响的任务也更多。`,
        })),
      finding("compact-depth-success", ["sixfig", "o23456compact"], ["success", "score"],
        ({metrics: m, pairs: p}) => ({
          title: `Compact保留了DepthPro的全部${m.success[0].total}项成功，并新增${p.success.more}项`,
          text: `O23456 DepthPro 6fig CUDA成功的任务，在Compact中全部成功；Compact另外成功${p.success.more}项，包括fasten_screws、solve_equation和press_by_number。两组${p.score.n}项均分为${percent(m.score[0].mean)}%、${percent(m.score[1].mean)}%。这不表示每项得分都更高：Compact仍有${p.score.less}项部分得分低于DepthPro，例如classify_objects_by_language。`,
        }), ["fasten_screws", "solve_equation", "press_by_number", "classify_objects_by_language"]),
      finding("depth-clear-tradeoff", ["o23456", "sixfig"], ["fine_placement_fail", "empty_retry"],
        ({metrics: m, pairs: p}) => ({
          title: "DepthPro比Clear精细放置失败更少，却有更多空夹",
          text: `O23456 Clear与DepthPro 6fig CUDA在精细放置的共同有效${p.fine_placement_fail.n}项上，确认失败分别为${m.fine_placement_fail[0].total}、${m.fine_placement_fail[1].total}次；DepthPro有${p.fine_placement_fail.less}项减少、${p.fine_placement_fail.more}项增加。空夹按${p.empty_retry.n}项比较则从${m.empty_retry[0].total}增至${m.empty_retry[1].total}次，两组都涉及${m.empty_retry[0].nonzero}项任务。放置和夹取的变化方向不同。`,
        })),
      finding("o1-compact-standard", ["o1standard", "o1compact"], ["success", "score"],
        ({metrics: m, pairs: p}) => ({
          title: `O1 Compact比O1 Standard多成功${m.success[1].total - m.success[0].total}项`,
          text: `${p.success.n}项中，O1 Standard与O1 Compact分别成功${m.success[0].total}、${m.success[1].total}项，均分${percent(m.score[0].mean)}%、${percent(m.score[1].mean)}%。O1 Compact新增${p.success.more}项成功，也丢失${p.success.less}项成功；play_Xylophone和sort_nesting_dolls_by_size从0分升至1分，但pick_from_conveyor_by_image从1分降至0分。`,
        }), ["play_Xylophone", "sort_nesting_dolls_by_size", "pick_from_conveyor_by_image"]),
      finding("o1-control-steps", ["o1standard", "o1compact"], ["turns", "actions"],
        ({metrics: m, pairs: p}) => ({
          title: "O1 Compact的控制步更多，但平均决策轮数几乎不变",
          text: `${p.actions.n}项中，O1 Standard与O1 Compact累计控制步为${m.actions[0].total}、${m.actions[1].total}，后者多${m.actions[1].total - m.actions[0].total}步（${percent((m.actions[1].total - m.actions[0].total) / m.actions[0].total)}%）；单任务均值从${number(m.actions[0].mean)}升至${number(m.actions[1].mean)}。平均决策轮数却仅从${number(m.turns[0].mean)}变为${number(m.turns[1].mean)}。模型决策轮数和实际环境控制步不能互相替代。`,
        })),
      finding("o456-o1-grasp", ["o1compact", "o456"], ["empty_retry", "drop", "success"],
        ({metrics: m, pairs: p}) => ({
          title: "O456 Clear比O1 Compact空夹更少，但掉落更多",
          text: `共同${p.empty_retry.n}项中，O1 Compact与O456 Clear确认空夹${m.empty_retry[0].total}、${m.empty_retry[1].total}次；O456在${p.empty_retry.less}项上减少、${p.empty_retry.more}项上增加。掉落反而从${m.drop[0].total}增至${m.drop[1].total}次，成功项从${m.success[0].total}降至${m.success[1].total}。空夹减少没有同时体现为掉落减少或成功任务增加。`,
        })),
      finding("clear-complementarity", ["o456", "o23456"], ["success", "score"],
        ({metrics: m, pairs: p}) => ({
          title: `两种Clear都成功${m.success[0].total}项，但各有${p.success.more}项独有成功`,
          text: `O456 Clear与O23456 Clear的总成功数相同，但不是同一组成功任务。O23456独有成功包括push_T、fold_clothes；O456独有成功包括stack_bowls、arrange_largest_number。${p.score.n}项得分比较中，O23456提高${p.score.more}项、降低${p.score.less}项、持平${p.score.equal}项；均分${percent(m.score[1].mean)}%，略高于O456的${percent(m.score[0].mean)}%。`,
        }), ["push_T", "fold_clothes", "stack_bowls", "arrange_largest_number"]),
      finding("high-low-outcomes", ["low", "high"], ["success", "score", "turns"],
        ({metrics: m, pairs: p}) => ({
          title: "High比Low均分略高，但成功数没有增加",
          text: `${p.score.n}项中，Low与High分别成功${m.success[0].total}、${m.success[1].total}项，均分${percent(m.score[0].mean)}%、${percent(m.score[1].mean)}%，只差${((m.score[1].mean - m.score[0].mean) * 100).toFixed(2)}个百分点。High新增${p.success.more}项成功、失去${p.success.less}项成功；平均决策轮数从${number(m.turns[0].mean)}升至${number(m.turns[1].mean)}。本轮没有呈现更高effort带来一致提升。`,
        })),
      finding("high-low-visibility", ["low", "high"], ["view_opposite", "view_same"],
        ({metrics: m, pairs: p}) => ({
          title: "High的异臂补视野次数更多，却集中在更少任务",
          text: `共同${p.view_opposite.n}项中，Low与High的异侧手臂补视野为${m.view_opposite[0].total}、${m.view_opposite[1].total}次，但发生该行为的任务为${m.view_opposite[0].nonzero}、${m.view_opposite[1].nonzero}项。同臂补视野反而从${m.view_same[0].total}降至${m.view_same[1].total}次。High的异臂观察动作更集中，不能把更多动作次数直接解释为更广的观察覆盖。`,
        })),
    ];
    return {scope, all, common, references, fixed};
  }
  return {analyze};
});
