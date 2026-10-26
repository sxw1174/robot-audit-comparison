const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const C = require("../core.js"), F = require("../findings.js");
const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "data.json"));
const D = JSON.parse(raw), A = F.analyze(D, C);
const verification = JSON.parse(fs.readFileSync(path.join(root, "data-verification-20261026-v2.json")));
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(digest(raw), verification.data_sha256);
assert.equal(A.tasks.length, 40);
for (const [field, expected] of Object.entries(F.expected)) {
  for (const [i, s] of A.metrics[field].entries()) {
    assert.equal(s.n, expected[0]);
    assert.ok(s.total === expected[i + 1] || Math.abs(s.total - expected[i + 1]) < 1e-8, field);
  }
}
const summary = s => Object.fromEntries(["n", "total", "mean", "median", "sd", "q1", "q3", "min", "max", "nonzero", "bounds"].map(k => [k, s[k]]));
const report = {
  schema_version: "four-group-descriptive-analysis-v1",
  source_data_sha256: digest(raw), verification_sha256: digest(fs.readFileSync(path.join(root, "data-verification-20261026-v2.json"))),
  source_observations: {low_high: D.audit_observed, o_groups: D.o_audit_observed},
  scope: F.scope, common_task_n: A.tasks.length, exclusions: ["build_tower", "push_T"],
  visual_rereview_performed: false,
  findings: F.fixed, discussions: F.sections, empty_grasp_evidence_notes: F.reviewTasks,
  metrics: D.metrics.map(m => ({...m, groups: A.metrics[m.key].map(s => ({
    group: s.group, ...summary(s), included: s.rows.map(r => ({
      run_id: r.id, analysis_sha256: r.source.analysis_sha256,
      value: r.metrics[m.key].value, status: r.metrics[m.key].status,
    })),
  }))})),
  pairs: A.pairs.map(p => ({groups: p.groups, metrics: Object.fromEntries(Object.entries(p.metrics).map(([k, s]) => [k, {
    ...summary(s), more: s.more, less: s.less, equal: s.equal,
    included: s.pairs.map(x => ({left: x.left.id, right: x.right.id, delta: x.delta})),
  }]))})),
  tasks: A.tasks.map(t => ({task: t.task, variant: t.variant, seed: t.seed, scene: t.scene,
    runs: t.rows.map(r => ({group: r.group, run_id: r.id, success: r.metrics.success.value, score: r.metrics.score.value,
      analysis_sha256: r.source.analysis_sha256, review_fingerprint: r.source.review_fingerprint || null})),
  })),
  scope_reconciliation: verification.o456_scope_reconciliation,
  limits: [
    "Four-way metric intersections; confirmation lower bounds and unknowns preserved.",
    "One first round; no causal attribution or statistical significance inference.",
    "Empty-grasp differences describe confirmed counts within the original coverage, not complete failure rates.",
    "Import checks are not a new independent visual audit.",
  ],
};
const num = x => x == null ? "—" : Number(x.toFixed(4)).toString();
const lines = [
  "# 四组首轮行为分析", "",
  "Low / High / O1 Compact / O456 Clear。仅本次四组，不包含历史看板分析与后补devset。",
  "", "## 范围与数据核对", "",
  "各组已获单项批准分析42 / 41 / 40 / 41份；共同40个task / variant / seed / scene，统一排除build_tower和push_T。每项指标再取四组有效交集。",
  `原生成功、得分及任务条件逐条核对164条；与原批准结果核对4264个指标值与状态、1078条事件定位。数据SHA：\`${digest(raw)}\`。`,
  "O配置整批最终验收尚未完成。统计核对不是新的全视频审核；空夹差异描述原核查覆盖内的确认计数。",
  "下文所有四组数字按Low / High / O1 / O456顺序排列。视觉数值均为声明核查覆盖内的确认下界，未知不补零。", "",
  "## 主要结论", "",
];
for (const f of F.fixed) lines.push(`### ${f.title}${f.review === "待专项复核" ? "（待专项复核）" : ""}`, "", f.text,
  `指标证据：${f.fields.map(k => D.metrics.find(m => m.key === k).id).join(" / ")}。任务来源：${f.tasks.join("、")}。`, "");
lines.push("## 26项完整统计", "", "每格：合计（任务均值；下界N）。N为同一四组有效交集。", "",
  "| 指标 | 有效N | Low | High | O1 Compact | O456 Clear |", "|---|---:|---:|---:|---:|---:|");
for (const m of D.metrics) lines.push(`| ${m.id} ${m.label} | ${A.metrics[m.key][0].n} | ${A.metrics[m.key].map(s =>
  s.n ? `${num(s.total)}（${num(s.mean)}；${s.bounds}）` : "未知，不填零").join(" | ")} |`);
lines.push("", "## 逐项分析", "");
for (const s of F.sections) {
  lines.push(`### ${s.title}`, "", s.text, "", s.extra, "",
    `指标：${s.fields.map(k => D.metrics.find(m => m.key === k).id).join(" / ")}。${s.tasks.length ? "任务：" + s.tasks.join("、") + "。" : ""}`, "");
  for (const ref of s.events || []) {
    const r = A.data.runs.find(r => r.group === ref.group && r.task === ref.task), e = r.events.find(e => e.id === ref.event);
    assert.ok(e && e.status === "confirmed");
    lines.push(`- ${ref.group} / ${ref.task} / ${e.id}，${e.time.join("–")}秒：${e.result}。原审核视觉依据：${e.visual}。源帧：${e.frames.join("、")}。原分析SHA：\`${r.source.analysis_sha256}\`。`);
  }
  lines.push("");
}
lines.push("## 空夹差异来源与证据边界", "",
  "实际抓取目的的闭合未形成有效夹持才计空夹；推物、按压和空手收爪不计。每次独立尝试只计一次。保留空夹/掉落分类候选，不补造指令或确认帧记录。",
  "相对Low：O456减少11项、增加4项、相同23项；相对High为16 / 7 / 15，相对O1为12 / 4 / 22，均N=38。",
  "下面包含被排除的未知任务，用于核查而不是补入数值分母。Low/High原视频未托管在此预览。", "");
for (const r of F.reviewTasks) lines.push(`- ${r.task}：${r.reason}`);
lines.push("", "## 40个共同任务原生结果", "", "每格为得分 / 成功标记（1成功，0失败）。", "",
  "| task | variant | seed / scene | Low | High | O1 Compact | O456 Clear |", "|---|---|---|---:|---:|---:|---:|");
for (const t of A.tasks) lines.push(`| ${t.task} | ${t.variant} | ${t.seed} / ${t.scene} | ${t.rows.map(r =>
  `${num(r.metrics.score.value)} / ${r.metrics.success.value}`).join(" | ")} |`);
lines.push("", "## O456成功率统计范围", "",
  "| 范围 | 成功数 / N | 成功率 |", "|---|---:|---:|",
  "| 全部已发布结果，含后补devset | 36 / 81 | 44.4% |",
  "| 完整首轮机器人实验 | 11 / 42 | 26.2% |",
  "| 已获批首轮分析 | 11 / 41 | 26.8% |",
  "| 四组共同任务 | 11 / 40 | 27.5% |", "",
  "push_T原生失败但分析缺失；后补39条成功25条。原实验首轮五能力等权成功率28.3%，不是逐记录等权指标。",
  "O456首轮达到100模型决策轮数的为4/42项，不是大多数失败；达到100轮不自动证明因预算截断。", "",
  "## 来源与使用边界", "",
  "所有数值可由four-group-analysis.json、data.json及core.js复算。指标证据链接固定四组共同范围，任务来源保留原分析SHA、当前复核指纹及已公开视频链接。",
  "Low/High审核包含gpt-6-sol与gpt-6.1-sol历史混合；O配置审核为gpt-6.1-sol medium。机器人均为gpt-6-astra；O配置是独立配置，不是只改变effort。",
  "跨组匹配任务不等于控制所有运行条件。本报告为单次首轮描述性观察，不证明因果、多seed稳定性或总体失败率。", "",
  "## 逐运行来源指纹", "");
for (const t of A.tasks) {
  lines.push(`### ${t.task} / ${t.variant} / seed${t.seed} / scene${t.scene}`, "");
  for (const r of t.rows) lines.push(`- ${r.group}：\`${r.id}\`；原分析SHA \`${r.source.analysis_sha256}\`${r.source.review_fingerprint ? "；当前批准指纹 `" + r.source.review_fingerprint + "`" : ""}。`);
  lines.push("");
}
for (const [name, data] of [["four-group-analysis.json", JSON.stringify(report, null, 2) + "\n"], ["four-group-analysis.md", lines.join("\n") + "\n"]]) {
  assert.ok(!/\/Users\/|\/data\/user\/|rawreasoning|rpc_body|github_pat_/.test(data), name);
  fs.writeFileSync(path.join(root, name), data);
}
console.log("Generated fixed four-group analysis, 26 metrics, 40 tasks, 6 pair sets and source indices.");
