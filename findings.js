(function (root, factory) {
  if (typeof module === "object") module.exports = factory();
  else root.AuditFindings = factory();
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  const scope = Object.freeze({
    groups: Object.freeze(["low", "high", "o1compact", "o456"]),
    scope: "common", policy: "bounds", task: "", variant: "", includeInterim: false,
  });
  const expected = {
    success: [40, 12, 11, 13, 11], score: [40, 14.1, 14.25, 15.15, 13.55],
    turns: [40, 2566, 2688, 2647, 2526], actions: [40, 22194, 23581, 22921, 19444],
    empty_retry: [38, 31, 41, 39, 16], drop: [38, 19, 26, 31, 32],
    empty_regrasp: [38, 16, 22, 12, 9], drop_regrasp: [37, 11, 13, 17, 15],
    direct_attempts: [40, 3, 4, 2, 8], direct_success: [40, 1, 0, 1, 2],
    table_attempts: [40, 11, 9, 10, 6], table_success: [40, 11, 9, 10, 6],
    support_attempts: [40, 0, 1, 1, 0], support_success: [40, 0, 1, 1, 0],
    view_same: [40, 15, 13, 18, 16], view_opposite: [40, 28, 47, 32, 29],
    abandon_near_action: [26, 0, 0, 0, 0], abandon_near_turn: [29, 0, 0, 0, 0],
    abandon_action_limit: [28, 0, 0, 0, 0], abandon_turn_limit: [34, 0, 0, 0, 0],
    collision_arms: [39, 0, 1, 5, 4], collision_arm_object: [40, 2, 4, 14, 12],
    collision_arm_table: [40, 0, 0, 0, 0], knockdown: [34, 0, 2, 1, 1],
    wrong_object: [0, null, null, null, null], fine_placement_fail: [33, 23, 18, 17, 14],
  };
  // Reviewed editorial snapshot. Selecting groups never creates a new finding.
  const fixed = [
    {
      id: "outcomes", title: "O1 Compact在共同任务上的成功率和均分最高",
      text: "40个共同任务中，四组成功率为30.0% / 27.5% / 32.5% / 27.5%，均分为0.3525 / 0.3563 / 0.3788 / 0.3388。O1比Low多成功1项，比High和O456多2项。",
      fields: ["success", "score"], tasks: ["play_Xylophone", "sort_nesting_dolls_by_size", "fold_clothes"],
    },
    {
      id: "shared", title: "半数任务得分一致，10项在四组均为零分",
      text: "20/40项任务的四组得分完全相同：7项均成功、10项均零分、3项相同部分得分。共同零分包括倒液体、扫积木和工具收纳，配置变化没有消除这些首轮难点。",
      fields: ["success", "score"], tasks: ["pour_liquid_into_cup", "sweep_blocks", "store_tools_in_toolbox"],
    },
    {
      id: "effort", title: "High增加决策、控制和补视野，未提高总体成功率",
      text: "相对Low，High记录的决策总数增加4.75%，控制步增加6.25%；异侧补视野确认计数由28增至47。成功项由12变为11，均分仅提高0.0038。",
      fields: ["turns", "actions", "view_opposite", "success", "score"],
      tasks: ["align_blocks", "plug_in_charger", "pack_objects_into_box"],
    },
    {
      id: "grasp", title: "O456 Clear空夹确认计数较低",
      text: "38个共同有效任务的空夹计数为31 / 41 / 39 / 16。O456相对O1在12项减少、4项增加、22项相同。这是现有核查覆盖内的确认计数，不等同于完整空夹率或夹取能力提升。",
      fields: ["empty_retry", "drop", "empty_regrasp"],
      tasks: ["deposit_coin", "hang_mugs", "store_tools_in_toolbox", "store_laptop_and_headphones"],
    },
    {
      id: "contact", title: "两个O配置确认的异常碰撞更多",
      text: "40个共同有效任务中，手臂与物体异常碰撞为2 / 4 / 14 / 12次；39个任务中，双臂异常碰撞为0 / 1 / 5 / 4次。差异有瓶子接近和双臂换手事件的具体来源。",
      fields: ["collision_arm_object", "collision_arms"],
      tasks: ["put_bottles_into_dustbin", "sweep_blocks", "insert_key"],
    },
    {
      id: "placement", title: "精细放置失败计数减少，不对应更高任务得分",
      text: "33个共同有效任务的精细放置失败为23 / 18 / 17 / 14次。O456该项计数最少，40个共同任务均分也最低；局部失误计数不能替代整体任务完成情况。",
      fields: ["fine_placement_fail", "score"], tasks: ["fasten_screws", "insert_key", "fold_clothes"],
    },
  ].map(row => Object.freeze({
    ...row, fields: Object.freeze(row.fields), tasks: Object.freeze(row.tasks),
    ids: scope.groups, scope, review: row.review || "统计已核对",
    evidence: Object.freeze(Object.fromEntries(row.fields.map(k => [k, expected[k]]))),
  }));
  const sections = [
    {
      id: "performance", title: "总体表现与任务间得失", fields: ["success", "score"],
      text: "O1均分领先Low 0.0263、High 0.0225、O456 0.0400。逐任务O1相对Low更高7项、更低4项、相同29项；相对High为10 / 6 / 24，相对O456为6 / 4 / 30。总体优势集中在部分任务，不是所有任务一致提升。",
      extra: "O1在play_Xylophone和sort_nesting_dolls_by_size独自得1分；High在align_blocks和plug_in_charger独自得1分；O456在solve_equation独自得1分。fold_clothes则Low/High各1分、两个O配置各0.2分。不同配置各有强项。",
      tasks: ["play_Xylophone", "sort_nesting_dolls_by_size", "align_blocks", "plug_in_charger", "solve_equation", "fold_clothes"],
    },
    {
      id: "difficulty", title: "共同成功与共同难点", fields: ["score", "success"],
      text: "同分20项包括：7项均成功、10项均零分、3项相同部分得分。共同零分任务为make_kong、make_toast、pick_from_conveyor_by_image、pour_balls_into_vase、pour_by_language、pour_liquid_into_cup、store_tools_in_toolbox、swap_T、swap_blocks、sweep_blocks。",
      extra: "共同成功任务为cover_blocks、general_pickup、match_and_pick_from_conveyor、press_by_number、stack_blocks、stack_blocks_by_language、stack_bowls。相同部分得分为insert_key（0.15）、play_tic_tac_toe（0.1）、put_bottles_into_dustbin（0.4）。同为零分不说明失败机制相同。",
      tasks: ["pour_by_language", "sweep_blocks", "insert_key", "put_bottles_into_dustbin"],
    },
    {
      id: "control", title: "决策与控制投入", fields: ["turns", "actions"],
      text: "决策合计为2566 / 2688 / 2647 / 2526；控制步为22194 / 23581 / 22921 / 19444。High相对Low增加4.75%和6.25%；O456相对O1减少4.57%和15.17%。",
      extra: "决策数包含下界的任务数为1 / 3 / 5 / 3，控制步为10 / 12 / 17 / 18。百分比比较的是发布记录合计，不等于完整动作成本、推理效率、费用或CPU耗时。首轮100决策上限只被O456的4/42项达到；更多失败不能一概归因于耗尽预算。",
      tasks: ["fill_pen_holder", "play_tic_tac_toe", "sort_nesting_dolls_by_size", "swap_blocks"],
    },
    {
      id: "recovery", title: "夹取失误与恢复", fields: ["empty_retry", "drop", "empty_regrasp", "drop_regrasp"],
      text: "空夹计数为31 / 41 / 39 / 16（N=38），涉及15 / 19 / 15 / 12项任务。掉落计数为19 / 26 / 31 / 32（N=38），涉及12 / 14 / 16 / 15项任务。O456较少的空夹没有伴随更少的掉落。",
      extra: "空夹后成功重夹为16 / 22 / 12 / 9（N=38）；掉落后成功重夹为11 / 13 / 17 / 15（N=37）。两类恢复的事件与分母不保证一一配对，不将总数相除为恢复率。O456 sweep_blocks先掉落、重夹、换手成功，随后再次掉落，最终仍为0分。",
      tasks: ["sweep_blocks", "deposit_coin", "hang_mugs"],
      events: [{group: "o456", task: "sweep_blocks", event: "broom_drop_01"}, {group: "o456", task: "sweep_blocks", event: "broom_drop_02"}],
    },
    {
      id: "handover", title: "直接换手与支撑面换手", fields: ["direct_attempts", "direct_success", "table_attempts", "table_success", "support_attempts", "support_success"],
      text: "直接换手尝试为3 / 4 / 2 / 8，成功为1 / 0 / 1 / 2（N=40），尝试仅涉及1 / 4 / 2 / 4项任务。桌面换手尝试及成功均为11 / 9 / 10 / 6，其他支撑面均为0 / 1 / 1 / 0。",
      extra: "这是已确认事件清单，不能推断桌面换手总体成功率为100%。solve_equation的Low、High与O456均记录桌面换手成功，原生得分分别为0、0、1；O1未记录桌面换手，得分为0。局部换手成功不等于任务成功。",
      tasks: ["solve_equation", "sweep_blocks"],
      events: [{group: "o456", task: "solve_equation", event: "T1"}, {group: "o456", task: "sweep_blocks", event: "handover_success_04"}],
    },
    {
      id: "observation", title: "补充视野", fields: ["view_same", "view_opposite", "score"],
      text: "同臂补视野为15 / 13 / 18 / 16，异侧为28 / 47 / 32 / 29（N=40）。High异侧计数最多，比Low多19次；逐任务更多8项、更少5项、相同27项。",
      extra: "补视野计数说明策略使用频度，不测量感知质量；未按遮挡机会和执行长度归一化。High的均分与Low接近、成功项略少，不能将补视野频度直接等同于有效感知或因果收益。",
      tasks: [],
    },
    {
      id: "collisions", title: "异常接触与物体扰动", fields: ["collision_arms", "collision_arm_object", "collision_arm_table", "knockdown"],
      text: "手臂与物体碰撞为2 / 4 / 14 / 12（N=40），涉及2 / 4 / 7 / 9项任务；双臂碰撞为0 / 1 / 5 / 4（N=39），涉及0 / 1 / 4 / 3项任务。",
      extra: "O1 put_bottles_into_dustbin记录4次接近瓶子的接触；O456 sweep_blocks确认两次换手中的双臂异常接触。撞桌均为0（N=40），非目标物碰倒为0 / 2 / 1 / 1（N=34）。掉落、碰撞、碰倒分别定义；候选接触不计入确认数，也不合并为总失误率。",
      tasks: ["put_bottles_into_dustbin", "sweep_blocks", "insert_key"],
      events: [{group: "o1compact", task: "put_bottles_into_dustbin", event: "pink-contact-1"}, {group: "o456", task: "sweep_blocks", event: "collision_01"}, {group: "o456", task: "sweep_blocks", event: "collision_02"}],
    },
    {
      id: "precision", title: "精细放置与整体结果", fields: ["fine_placement_fail", "score"],
      text: "精细放置失败为23 / 18 / 17 / 14（N=33），涉及12 / 9 / 10 / 9项任务。O456确认计数最少，均分排序却不同。insert_key四组均为0.15分，fasten_screws为0 / 0.5 / 1 / 0.2。",
      extra: "尝试机会、执行长度和核查覆盖都可能影响失误计数。减少局部放置失败，不直接代表完成装配；应同时保留原生结果、事件和失败机会。",
      tasks: ["insert_key", "fasten_screws"],
    },
    {
      id: "budget", title: "预算放弃与不可判定指标", fields: ["abandon_near_action", "abandon_near_turn", "abandon_action_limit", "abandon_turn_limit", "wrong_object"],
      text: "靠近动作预算、靠近决策预算、达到动作预算、达到决策预算的主动放弃，在各自共同N=26 / 29 / 28 / 34内均未确认。未确认主动放弃不等于没有预算上限或系统截断。",
      extra: "选错物体m25的四组共同可判定样本为0，原始任务指令缺失等原因仍保留，不能写成“没有选错物体”。原模型自述、未知值和未覆盖项不补零，不进入客观分母。",
      tasks: [],
    },
  ];
  const reviewTasks = [
    {task: "deposit_coin", reason: "O1确认5次空夹，O456为0；重点核对实际抓取闭合与未形成夹持的尝试。"},
    {task: "hang_mugs", reason: "O1为5，O456为1；统一空夹、短暂持物后掉落及独立重试的划分。"},
    {task: "store_tools_in_toolbox", reason: "O1为4，O456为0；核对零计数是否来自真实无空夹或未覆盖短暂事件。"},
    {task: "make_toast", reason: "Low / High / O1 / O456为2 / 4 / 3 / 0；核对跨组覆盖与操作阶段。"},
    {task: "store_laptop_and_headphones", reason: "O456为4，高于Low 2、High 0、O1 0；必须同时核对反向差异。"},
    {task: "sort_nesting_dolls_by_size", reason: "High空夹未知，不在N=38内；O456存在早期空夹/掉落候选，不能补零或直接纳入。"},
    {task: "stack_blocks_by_language", reason: "High首次抓取失败无法区分空夹与短暂遮挡持物，继续排除，不补造确认事件。"},
    {task: "align_blocks", reason: "O456工具夹持有空夹候选；推物、按压和空手收爪不应计为抓取失败。"},
  ];
  function dataset(data, core) {
    const rows = core.rowsFor(data, scope).filter(r => !["build_tower", "push_T"].includes(r.task));
    const sets = scope.groups.map(g => new Set(rows.filter(r => r.group === g).map(core.key)));
    const keys = new Set([...sets[0]].filter(k => sets.every(s => s.has(k))));
    return {...data, runs: rows.filter(r => keys.has(core.key(r)))};
  }
  function analyze(data, core) {
    const locked = dataset(data, core);
    const metrics = Object.fromEntries(data.metrics.map(m => [m.key, core.summaries(locked, scope, m.key)]));
    const tasks = [...new Set(locked.runs.map(core.key))].sort().map(key => {
      const rows = scope.groups.map(g => locked.runs.find(r => r.group === g && core.key(r) === key));
      return {key, task: rows[0].task, variant: rows[0].variant, seed: rows[0].seed, scene: rows[0].scene, rows};
    });
    const pairs = [];
    for (let a = 0; a < scope.groups.length; a++) for (let b = a + 1; b < scope.groups.length; b++) {
      pairs.push({groups: [scope.groups[a], scope.groups[b]], metrics: Object.fromEntries(data.metrics.map(m => {
        // Pair summaries use the same four-way metric intersection as fixed findings.
        const eligible = {...locked, runs: core.eligible(locked, scope, m.key)};
        return [m.key, core.pair(eligible, scope, m.key, scope.groups[a], scope.groups[b])];
      }))});
    }
    return {data: locked, metrics, tasks, pairs};
  }
  return {fixed: Object.freeze(fixed), scope, expected, sections, reviewTasks, dataset, analyze};
});
