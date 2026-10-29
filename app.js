/* All views and downloads share the same metric eligibility functions. */
"use strict";
const D = window.AUDIT_DATA, C = window.AuditCore;
const F = window.AuditFindings, A = F.analyze(D, C);
const Current = window.CurrentFindings.analyze(D, C);
const $ = id => document.getElementById(id);
const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (n, digits = 2) => n == null || !Number.isFinite(n) ? "—" : n.toLocaleString("zh-CN", {maximumFractionDigits: digits});
const signed = n => n == null ? "—" : (n > 0 ? "+" : "") + fmt(n, n !== 0 && Math.abs(n) < .01 ? 4 : 2);
const group = id => D.groups.find(g => g.id === id);
const metric = key => D.metrics.find(m => m.key === key);
const icon = name => `<i data-lucide="${name}"></i>`;
const defaultGroups = () => D.groups.filter(g=>g.source==="本批批准分析").map(g=>g.id);
const state = {groups:defaultGroups(),scope:"all",task:"",variant:"",policy:"bounds",includeInterim:false};
const local = {taskSearch:"", taskSort:"task", taskMetric:"score", eventSearch:"", eventStatus:"", eventMetric:"", eventPage:0};
const titles = {
  overview:["实验总览","实验总览","四组首轮行为分析"],
  analysis:["四组分析","四组分析","Low / High / O1 Compact / O456 Clear · 固定40个共同任务"],
  metrics:["指标统计","指标统计","26项指标 · 结果、夹取、恢复、换手、观察与操作误差"],
  tasks:["任务对照","任务对照","task / variant / seed / scene"],
  evidence:["事件证据","事件证据","视觉事件、帧定位与来源指纹"],
  relations:["实验配置","实验配置","方法设置、运行环境与历史来源"],
  methods:["数据与方法","数据与方法","数据范围、统计口径与来源"],
};
function route(){return Object.hasOwn(titles,location.hash.slice(1))?location.hash.slice(1):"overview";}
function displayName(g){return g.name.replace(/^历史\s+/,"");}
function groupName(id){const g=group(id);return `<span class="group-name"><span class="swatch" style="background:${g.color}"></span>${esc(displayName(g))}</span>`;}
function statusBadge(status){
  const labels={confirmed:"已确认",lower_bound:"确认下界",unknown:"未知",na:"未覆盖",pending:"待审核",self_report:"仅自述",
    approved:"已批准",partial:"部分完成",complete:"程序完成",needs_attention:"需关注",interim:"阶段性",logs_images:"日志与图像核查",uncertain:"待确认",candidate:"候选"};
  return `<span class="badge ${["pending","partial","needs_attention","interim","self_report","uncertain","candidate"].includes(status)?"warn":["unknown","na"].includes(status)?"muted":""}">${esc(labels[status]||status)}</span>`;
}
function section(n,title,sub="",link=""){
  return `<div class="section-head"><div><h2><span class="section-number">${n}</span>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>${link}</div>`;
}
function chip(g){
  const suffix=`分析样本 ${D.runs.filter(r=>r.group===g.id).length}`;
  return `<label class="group-chip" style="--group-color:${g.color}"><input type="checkbox" data-group="${g.id}" ${state.groups.includes(g.id)?"checked":""}><span class="swatch"></span>${esc(displayName(g))}${suffix?`<small>${esc(suffix)}</small>`:""}</label>`;
}
function pairIds(){return C.selectedPair(state);}
function pairLabel(ids){return ids?`${esc(displayName(group(ids[1])))} − ${esc(displayName(group(ids[0])))}`:"";}
function refreshIcons(){if(window.lucide)window.lucide.createIcons();}
function renderFilters(){
  $("group-picker").innerHTML=D.groups.map(chip).join("");
  $("extra-groups").innerHTML=`<label class="inline-check"><input type="checkbox" id="include-interim" ${state.includeInterim?"checked":""}>纳入阶段性结果</label>`;
  $("scope").value=state.scope;$("task").value=state.task;$("variant").value=state.variant;$("policy").value=state.policy;
  const raw=C.rowsFor(D,state), sets=C.summaries(D,state,"score"), min=sets.length?Math.min(...sets.map(s=>s.n)):0;
  $("scope-summary").innerHTML=state.groups.length?`<strong>${raw.length}</strong> 条范围内记录 · ${state.scope==="common"?`得分共同有效 <strong>${min}</strong> 组任务条件`:"各组独立分母"} · seed 0 / scene 0 · 行为指标逐项重算有效 N${state.policy==="bounds"?" · † 表示纳入确认下界":""}`:"未选择实验组";
}
function render(){
  const page=route(),[name,title,sub]=titles[page];
  $("breadcrumb").textContent=name;$("page-title").textContent=title;$("page-subtitle").textContent=sub;
  if(page==="overview"){
    $("page-subtitle").textContent="固定研究结论 · 所选实验组统计";
  }
  document.querySelectorAll(".sidebar nav a").forEach(a=>a.classList.toggle("active",a.hash==="#"+page));
  renderFilters();
  $("view").innerHTML=!state.groups.length&&["metrics","tasks","evidence","relations"].includes(page)?'<div class="empty">未选择实验组。</div>':({overview,analysis,metrics,tasks,evidence,relations,methods}[page])();
  refreshIcons();
}
function overview(){
  const fields=["success","score","turns","actions"];
  const kpis=fields.map(field=>{
    const def=metric(field), summaries=C.summaries(D,state,field);
    return `<div class="kpi"><h3>${def.label==="成功"?"分析样本原生成功率":def.label==="得分"?"任务等权均分":def.label}</h3>${summaries.map(s=>
      `<div class="kpi-value">${groupName(s.group)}<strong>${s.n?(field==="success"?fmt(s.mean*100,1)+"%":fmt(s.mean,field==="score"?3:1)):"—"}</strong></div>
       <small>${esc(displayName(group(s.group)))} · ${field==="success"?`${fmt(s.total,0)} / ${s.n} 成功`:`n=${s.n}${field==="turns"||field==="actions"?" · 合计 "+fmt(s.total,0):""}`}</small>`).join("")}</div>`;
  }).join("");
  const sums=C.summaries(D,state,"score");
  const bars=sums.map(s=>{
    const vals=s.rows.map(r=>r.metrics.score.value), zero=vals.filter(v=>v===0).length, full=vals.filter(v=>v===1).length, partial=s.n-zero-full;
    return `<div class="chart-group"><div class="chart-group-header">${groupName(s.group)}<span>零分 ${zero} · 部分 ${partial} · 满分 ${full}</span></div>
      <div class="bar-stack" role="img" aria-label="${esc(displayName(group(s.group)))}：零分${zero}，部分得分${partial}，满分${full}">${s.n?
      `<span class="zero" style="width:${zero/s.n*100}%"></span><span class="partial" style="width:${partial/s.n*100}%"></span><span class="full" style="width:${full/s.n*100}%"></span>`:""}</div></div>`;
  }).join("");
  const ids=pairIds(), conclusions=Current.fixed;
  const findings=conclusions.length?`<div class="conclusion-list">${conclusions.map((f,i)=>`<article class="conclusion" data-finding="${f.id}">
    <div class="conclusion-number">${String(i+1).padStart(2,"0")}</div><div><h3>${esc(f.title)}</h3>${f.review==="待专项复核"?'<span class="badge warn">待专项复核 · 未重新审核原视频</span>':""}<p>${esc(f.text)}</p>
    <div class="conclusion-sources">${f.fields.map(field=>`<button class="text-button" data-current-metric="${field}" data-current-finding="${f.id}">${metric(field).id} ${esc(metric(field).label)} ${icon("arrow-up-right")}</button>`).join("")}</div>
    ${f.tasks.length?`<div class="conclusion-sources">${f.tasks.map(task=>`<button class="text-button" data-task="${esc(task)}" data-current-proof="true" data-current-finding="${f.id}">${esc(task)} ${icon("arrow-up-right")}</button>`).join("")}</div>`:""}</div>
    </article>`).join("")}</div>`:'<div class="empty">暂无已整理的结论。</div>';
  const top=ids?C.pair(D,state,"score",...ids).pairs.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,6):[];
  return `<section id="fixed-findings">
    ${section("01","主要结论")}
    ${findings}
    ${currentResultsTable()}
    </section><section id="selected-results">
    ${section("02","所选实验组统计",state.groups.length?state.groups.map(id=>esc(displayName(group(id)))).join(" · "):"未选择实验组")}
    ${!state.groups.length?'<div class="empty">未选择实验组。</div></section>':`
    <div class="notice">以下仅统计纳入本页分析的记录，不是原实验全部已发布结果的成绩。跨配置差异不等于单一因素效果；完整统计范围核对见四组分析。</div>
    <div class="kpi-grid">${kpis}</div>
    ${section("03","得分分布","原生得分；部分得分指 0 < score < 1")}
    <div class="chart-area">${bars}<div class="bar-legend"><span class="legend-item"><i class="swatch" style="background:#ccd4d0"></i>零分</span><span class="legend-item"><i class="swatch" style="background:#b2c8b9"></i>部分得分</span><span class="legend-item"><i class="swatch" style="background:#447d62"></i>满分</span></div></div>
    ${ids?`${section("04","任务得分差异",`${pairLabel(ids)} · 按绝对得分差排序`,'<a href="#tasks">全部任务 '+icon("arrow-right")+"</a>")}
    <div class="table-wrap"><table><thead><tr><th>任务</th><th>${ids?esc(displayName(group(ids[0]))):"组A"}</th><th>${ids?esc(displayName(group(ids[1]))):"组B"}</th><th>得分差</th><th>证据</th></tr></thead><tbody>${top.map(p=>
      `<tr><td><span class="task-name">${esc(p.left.task)}</span><span class="cell-sub">${esc(p.left.variant)} · s${p.left.seed} / scene${p.left.scene}</span></td><td>${fmt(p.left.metrics.score.value)}</td><td>${fmt(p.right.metrics.score.value)}</td><td>${signed(p.delta)}</td><td><button class="icon-button" data-task="${esc(p.left.task)}" title="查看任务对照" aria-label="查看${esc(p.left.task)}任务对照">${icon("arrow-up-right")}</button></td></tr>`).join("")||'<tr><td colspan="5">当前范围无有效配对。</td></tr>'}</tbody></table></div>`:section("04","逐任务数据","所选实验组并列展示",'<a href="#tasks">查看任务对照 '+icon("arrow-right")+"</a>")}
    ${section("05","行为指标",state.policy==="bounds"?"† 为已声明覆盖内的确认下界；不同指标有效N可能不同":"仅已确认数值",'<a href="#metrics">全部26项 '+icon("arrow-right")+"</a>")}
    ${metricTable(["empty_retry","drop","empty_regrasp","view_opposite","fine_placement_fail"])}`}</section>`;
}
function currentResultsTable(){
  const rows=D.groups.map(g=>{
    const own=Current.scope.groups.includes(g.id),ref=Current.references.find(r=>r.group===g.id);
    const success=own?Current.all.success.find(s=>s.group===g.id):ref.success;
    const score=own?Current.all.score.find(s=>s.group===g.id):ref.score;
    const common=Current.common.score.find(s=>s.group===g.id);
    const n=D.runs.filter(r=>r.group===g.id).length;
    return `<tr><td>${groupName(g.id)}<span class="cell-sub">${own?"分析结果":score.n?"外部参考":"阶段性 · 不参与排名"}</span></td><td>${n} / ${g.planned}</td><td>${success.n?`${success.total} / ${success.n} · ${fmt(success.mean*100,1)}%`:"—"}</td><td>${score.n?fmt(score.mean*100,1)+"%":"—"}</td><td>${common?`${fmt(common.mean*100,1)}% · N=${common.n}`:"不纳入"}</td></tr>`;
  }).join("");
  return `<details class="detail-section"><summary>全部组结果与统计分母</summary><p>得分均为任务等权均分，不是五能力等权分。阶段性结果保留在筛选器中，未进入正式结论；缺项和未知不填零。旧四组共同40项的详细分析作为独立范围保留，不代表当前全部组排名。</p><div class="table-wrap"><table><thead><tr><th>实验组 / 来源</th><th>收录 / 计划</th><th>成功</th><th>任务均分</th><th>8组共同任务均分</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
}
function metricCell(s,field){
  return s.n?`<span class="value">${fmt(s.mean,field==="score"?3:2)}${s.bounds?"†":""}</span><span class="cell-sub">n=${s.n} · 合计 ${fmt(s.total)}</span>`:'<span class="muted">—</span><span class="cell-sub">n=0</span>';
}
function proofLinks(fields){
  return fields.map(field=>`<button class="text-button" data-proof-metric="${field}">${metric(field).id} ${esc(metric(field).label)} ${icon("arrow-up-right")}</button>`).join("");
}
function proofTasks(tasks){
  return tasks.map(task=>`<button class="text-button" data-task="${esc(task)}" data-fixed-proof="true">${esc(task)} ${icon("arrow-up-right")}</button>`).join("");
}
function analysis(){
  const columns=F.scope.groups.map(g=>`<th>${groupName(g)}</th>`).join("");
  const metricRows=D.metrics.map(m=>`<tr class="click-row" data-proof-metric="${m.key}" tabindex="0" role="button" aria-label="查看固定四组${esc(m.label)}证据">
    <td><span class="metric-name"><span class="metric-id">${m.id}</span>${esc(m.label)}</span><span class="cell-sub">${esc(m.unit)} · N=${A.metrics[m.key][0].n}</span></td>
    ${A.metrics[m.key].map(s=>`<td>${s.n?`<strong>${fmt(s.total)}${s.bounds?"†":""}</strong><span class="cell-sub">均值 ${fmt(s.mean,4)} · 下界N ${s.bounds}</span>`:'—<span class="cell-sub">N=0 · 不填零</span>'}</td>`).join("")}</tr>`).join("");
  const sections=F.sections.map((s,i)=>`<section class="analysis-section" id="analysis-${s.id}">
    <h2>${String(i+1).padStart(2,"0")} / ${esc(s.title)}</h2><p>${esc(s.text)}</p><p class="analysis-limit">${esc(s.extra)}</p>
    <div class="conclusion-sources">${proofLinks(s.fields)}${proofTasks(s.tasks)}</div>
    ${(s.events||[]).map(ref=>{const r=A.data.runs.find(r=>r.group===ref.group&&r.task===ref.task),e=r.events.find(e=>e.id===ref.event);
      return `<p class="analysis-event"><button class="text-button" data-run="${esc(r.id)}" data-event="${esc(e.id)}">${esc(group(r.group).name)} · ${esc(r.task)} · ${esc(e.id)} ${icon("arrow-up-right")}</button><span class="cell-sub">${eventLocation(e)} · ${esc(e.result)}</span></p>`;
    }).join("")}</section>`).join("");
  const reviewRows=F.reviewTasks.map(item=>`<tr><td><button class="text-button" data-task="${esc(item.task)}" data-fixed-proof="true">${esc(item.task)}</button></td>
    ${F.scope.groups.map(g=>{const r=A.data.runs.find(r=>r.group===g&&r.task===item.task),m=r.metrics.empty_retry;return `<td>${fmt(m.value)}${m.status==="lower_bound"?"†":""}<span class="cell-sub">${statusBadge(m.status)}</span></td>`}).join("")}<td class="reason">${esc(item.reason)}</td></tr>`).join("");
  return `<div class="analysis-report">
    <div class="notice green">本节为Low、High、O1 Compact、O456 Clear四组首轮分析。固定40个task / variant / seed / scene共同条件，逐指标取四组有效交集；不包含新增O1 Standard、历史公开组或后补devset。</div>
    <p class="caption">所有并列数字按Low / High / O1 / O456排列。164条分析的4264个指标值及状态、1078条事件定位与来源已核对；本次未重新进行全视频审核。O配置整批最终验收尚未完成，只使用已获单项批准的结果。</p>
    ${section("01","指标全集","26项全部列出 · 单格为合计及均值 · † 为纳入确认下界")}
    <div class="table-wrap sticky-table"><table><thead><tr><th>指标 / 四组有效N</th>${columns}</tr></thead><tbody>${metricRows}</tbody></table></div>
    ${section("02","逐项分析","原生结果、行为计数、事件来源与证据边界")}
    ${sections}
    ${section("03","空夹差异证据","现有确认计数不是完整空夹率")}
    <p>O456相对Low减少11项、增加4项、相同23项；相对High减少16项、增加7项、相同15项；相对O1减少12项、增加4项、相同22项，均使用同一N=38子集。</p>
    <p>统计口径：实际抓取目的的闭合未形成有效夹持才计空夹；推物、按压、空手收爪不计。每次独立尝试只计一次。下列任务保留计数下降、反向增加、零计数和遮挡候选的来源说明；其中两项High未知任务仍排除在N=38外。</p>
    <div class="table-wrap"><table><thead><tr><th>任务</th>${columns}<th>来源与证据边界</th></tr></thead><tbody>${reviewRows}</tbody></table></div>
    <p class="caption">sort_nesting_dolls_by_size与stack_blocks_by_language因High未知而排除。Low/High原视频未托管于此预览。候选事件、缺失指令和未知值均按原来源保留。</p>
    ${section("04","共同任务结果","固定40项 · 每格为原生得分 / 成功标记")}
    <div class="table-wrap"><table><thead><tr><th>task / variant / seed / scene</th>${columns}</tr></thead><tbody>${A.tasks.map(t=>`<tr><td><button class="text-button" data-task="${esc(t.task)}" data-fixed-proof="true">${esc(t.task)}</button><span class="cell-sub">${esc(t.variant)} / ${t.seed} / ${t.scene}</span></td>
      ${t.rows.map(r=>`<td><button class="text-button" data-run="${esc(r.id)}">${fmt(r.metrics.score.value,3)} / ${r.metrics.success.value? "成功":"失败"} ${icon("arrow-up-right")}</button></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    ${section("05","统计范围核对","O456成功率的不同分母 · 2026年10月26日公开快照")}
    <div class="table-wrap"><table><thead><tr><th>范围</th><th>成功数 / N</th><th>逐记录成功率</th></tr></thead><tbody>
      <tr><td>全部已发布结果，含后补devset</td><td>36 / 81</td><td>44.4%</td></tr>
      <tr><td>完整首轮机器人实验</td><td>11 / 42</td><td>26.2%</td></tr>
      <tr><td>已获批首轮分析</td><td>11 / 41</td><td>26.8%</td></tr>
      <tr><td>本节四组共同任务</td><td>11 / 40</td><td>27.5%</td></tr>
    </tbody></table></div>
    <p>未分析的push_T原生失败，不能把它加入行为指标并填零。后补39条有25条成功，解释全部发布成绩为何较高。原实验看板的首轮五能力等权成功率为28.3%，与上述逐记录等权指标也不同。</p>
    ${section("06","来源与复现","结果SHA、当前复核指纹和原视频定位保留在逐运行来源中")}
    <p>单次首轮、非控制变量的四组描述性比较；Low/High审核含gpt-6-sol与gpt-6.1-sol历史混合来源，O组审核为gpt-6.1-sol medium。机器人均为gpt-6-astra；O组是独立配置，不是单纯改变effort。</p>
    <div class="download-list"><a class="button" href="four-group-analysis.md" download>${icon("file-text")}完整分析文档</a><a class="button" href="four-group-analysis.json" download>${icon("download")}统计与证据索引</a><a class="button" href="data-verification-20261026-o1-standard.json" download>${icon("file-check")}数据核对记录</a></div>
    </div>`;
}
function metricTable(keys,sections=false){
  let last="";const ids=pairIds();
  const rows=keys.map(key=>{
    const m=metric(key),sets=C.summaries(D,state,key),p=ids?C.pair(D,state,key,...ids):null;
    const header=sections&&last!==m.section?`<tr class="section-row"><td colspan="${state.groups.length+1+(ids?2:0)}">${esc(m.section)}</td></tr>`:"";last=m.section;
    return header+`<tr class="click-row" data-metric="${key}" tabindex="0" role="button" aria-label="查看${esc(m.label)}统计">
      <td><span class="metric-name"><span class="metric-id">${m.id}</span>${esc(m.label)}</span><span class="cell-sub">单位：${m.unit} · 单格为均值</span></td>
      ${sets.map(s=>`<td>${metricCell(s,key)}</td>`).join("")}${ids?`<td>${p?.n?signed(p.mean):"—"}<span class="cell-sub">n=${p.n}</span></td>
      <td>${p?.n?`${p.less} / ${p.equal} / ${p.more}`:"—"}<span class="cell-sub">减少 / 持平 / 增加</span></td>`:""}</tr>`;
  }).join("");
  return `<div class="table-wrap sticky-table"><table><thead><tr><th>指标</th>${state.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}${ids?`<th>${pairLabel(ids)}</th><th>配对方向</th>`:""}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function metrics(){
  return `<div class="notice green">所有26项均保留。视觉零值表示覆盖范围内未确认发现；未知、未覆盖、待审核不进入数值分母。† 与精确计数分别保留。</div>
    ${metricTable(D.metrics.map(m=>m.key),true)}<p class="caption">各组均值遵循顶部统计范围。仅恰好选择两组时展示差值与方向，使用该两组的有效配对样本。</p>`;
}
function tasks(){
  const field=local.taskMetric,m=metric(field),rows=C.rowsFor(D,state), ids=pairIds();
  const byKey=new Map();
  for(const r of rows){if(!byKey.has(C.key(r)))byKey.set(C.key(r),{});byKey.get(C.key(r))[r.group]=r;}
  const validKeys=new Set(C.eligible(D,state,field).map(C.key));
  let all=[...byKey.values()].map(entries=>({entries,base:Object.values(entries)[0]}))
    .filter(x=>!local.taskSearch||x.base.task.toLowerCase().includes(local.taskSearch.toLowerCase()));
  const delta=x=>ids&&ids.every(g=>C.usable(x.entries[g]?.metrics[field],state.policy))?x.entries[ids[1]].metrics[field].value-x.entries[ids[0]].metrics[field].value:null;
  all.sort((a,b)=>{
    if(local.taskSort==="delta"){
      const da=delta(a),db=delta(b);
      if(da===null&&db!==null)return 1;
      if(db===null&&da!==null)return -1;
      if(da!==null&&db!==null&&Math.abs(da)!==Math.abs(db))return Math.abs(db)-Math.abs(da);
    }
    return a.base.task.localeCompare(b.base.task);
  });
  const options=D.metrics.map(d=>`<option value="${d.key}" ${field===d.key?"selected":""}>${d.id} ${esc(d.label)}</option>`).join("");
  return `<div class="toolbar"><label class="control-label">任务检索<input id="task-search" type="search" placeholder="搜索任务名" value="${esc(local.taskSearch)}"></label>
    <label class="control-label">展示指标<select id="task-metric">${options}</select></label><label class="control-label">排序<select id="task-sort"><option value="task">任务名称</option>${ids?`<option value="delta" ${local.taskSort==="delta"?"selected":""}>差异绝对值</option>`:""}</select></label></div>
    <p class="caption">完整任务清单 · ${all.length}组条件 · 灰色标记表示未进入当前指标的共同统计；缺失项仍保留。</p>
    <div class="table-wrap"><table><thead><tr><th>任务 / 条件</th>${state.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}${ids?`<th>${pairLabel(ids)}</th>`:""}<th>详情</th></tr></thead><tbody>
    ${all.map(({base,entries})=>`<tr><td><span class="task-name">${esc(base.task)}</span><span class="cell-sub">${esc(base.variant)} · seed${base.seed} / scene${base.scene}${!validKeys.has(C.key(base))?" · 未纳入":""}</span></td>
      ${state.groups.map(g=>{const r=entries[g],v=r?.metrics[field],missing=D.missing.some(x=>x.group===g&&C.key(x)===C.key(base));return `<td>${v?`<span class="value">${fmt(v.value)}${v.status==="lower_bound"?"†":""}</span><span class="cell-sub">${statusBadge(v.status)}</span>`:`<span class="badge warn">${missing?"分析缺失":"无记录"}</span>`}</td>`}).join("")}
      ${ids?`<td>${signed(delta({entries}))}</td>`:""}<td><button class="icon-button" data-task="${esc(base.task)}" title="查看任务详情" aria-label="查看${esc(base.task)}">${icon("arrow-up-right")}</button></td></tr>`).join("")||`<tr><td colspan="${state.groups.length+2+(ids?1:0)}">无匹配任务</td></tr>`}</tbody></table></div>
    <p class="caption">当前指标：${m.id} ${esc(m.label)}。单条运行值完整展示，统计是否纳入由状态和共同范围决定。</p>`;
}
function evidence(){
  const rows=C.rowsFor(D,state);
  let events=rows.flatMap(r=>r.events.map(e=>({run:r,event:e})));
  if(local.eventSearch)events=events.filter(x=>(x.run.task+" "+x.event.result+" "+x.event.id).toLowerCase().includes(local.eventSearch.toLowerCase()));
  if(local.eventStatus)events=events.filter(x=>local.eventStatus==="confirmed"?x.event.status==="confirmed":x.event.status!=="confirmed");
  if(local.eventMetric)events=events.filter(x=>x.event.metrics.includes(local.eventMetric));
  const pages=Math.max(1,Math.ceil(events.length/12));local.eventPage=Math.min(local.eventPage,pages-1);
  const part=events.slice(local.eventPage*12,(local.eventPage+1)*12);
  return `<div class="notice green">事件清单按任务与实验组筛选，不按数值指标分母隐藏证据。候选与待确认事件不计入确认数；其他配置的完整事件见原报告。</div>
    <div class="toolbar"><label class="control-label">事件检索<input id="event-search" type="search" placeholder="任务、事件或结果" value="${esc(local.eventSearch)}"></label>
      <label class="control-label">审核状态<select id="event-status"><option value="">全部状态</option><option value="confirmed" ${local.eventStatus==="confirmed"?"selected":""}>已确认</option><option value="uncertain" ${local.eventStatus==="uncertain"?"selected":""}>候选 / 待确认</option></select></label>
      <label class="control-label">对应指标<select id="event-metric"><option value="">全部指标</option>${D.metrics.slice(4).map(m=>`<option value="${m.key}" ${local.eventMetric===m.key?"selected":""}>${m.id} ${m.label}</option>`).join("")}</select></label></div>
    <p class="caption">${events.length} 条已导入事件 · 第 ${local.eventPage+1} / ${pages} 页</p>
    <div class="event-grid">${part.map(({run:r,event:e})=>`<article class="event"><header>${groupName(r.group)}${statusBadge(e.status)}</header><h3>${esc(r.task)}</h3>
      <span class="event-location">${esc(e.id)} · ${eventLocation(e)}</span><p>${esc(e.result)}</p>
      <span class="cell-sub">${e.metrics.map(k=>metric(k)?.id).filter(Boolean).join(" · ")||"原报告事件"}</span>
      <button class="text-button" data-run="${esc(r.id)}" data-event="${esc(e.id)}">查看来源 ${icon("arrow-up-right")}</button></article>`).join("")||'<div class="empty">当前条件无已导入事件；未导入不代表事件数为零。</div>'}</div>
    <div class="pager"><button class="icon-button" data-page="-1" ${local.eventPage===0?"disabled":""} aria-label="上一页" title="上一页">${icon("chevron-left")}</button><span>${local.eventPage+1} / ${pages}</span><button class="icon-button" data-page="1" ${local.eventPage>=pages-1?"disabled":""} aria-label="下一页" title="下一页">${icon("chevron-right")}</button></div>`;
}
function eventLocation(e){
  return e.time?.every(C.numeric)?`${fmt(e.time[0])}–${fmt(e.time[1])} s`:
    e.decisions?.some(C.numeric)?`关联决策 ${e.decisions.filter(C.numeric).join("–")} · 非精确时间`:"见源帧定位";
}
function relations(){
  const selected=D.groups.filter(g=>state.groups.includes(g.id));
  return `<div class="notice">仅列出已勾选的实验组。标记为“本次”的是本轮实际分析；“历史”和“阶段性”数据来自公开看板，仅作参照。</div>
    <div class="compare-strip">${selected.map(g=>`<div class="compare-item" style="--group-color:${g.color}">${groupName(g.id)}<p>${esc(g.family)}</p><strong>${D.runs.filter(r=>r.group===g.id).length}<small> / ${g.planned}</small></strong><p>${statusBadge(g.audit)}</p></div>`).join("")}</div>
    ${section("01","所选配置","同一配置族不等于同一运行；不同配置的成绩差异不是纯effort效应")}
    <div class="table-wrap"><table class="relationship-table"><thead><tr><th>实验</th><th>配置族 / effort</th><th>状态</th><th>对应关系与限制</th><th>来源</th></tr></thead><tbody>
      ${selected.map(g=>`<tr><td>${groupName(g.id)}<span class="cell-sub">${g.completed!=null?`${g.approved_count??g.completed}/${g.planned} 项复核批准 · `:""}${D.runs.filter(r=>r.group===g.id).length} 条运行</span></td><td>${esc(g.family)}<span class="cell-sub">${esc(g.effort)} · ${esc(g.model)}</span></td><td>${statusBadge(g.audit)}</td><td class="reason">${esc(g.relation)}</td><td>${g.url?`<a href="${g.url}" target="_blank" rel="noopener">原报告 ${icon("arrow-up-right")}</a>`:'<a href="#methods">本批来源</a>'}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="relation-notes"><section><h3>运行身份与重复统计</h3><p>已导入${D.runs.length}条记录的run_id互不重复。名称相同的任务按task、variant、seed、scene匹配；这不是源文件哈希级的全库去重证明。若后续确认同一原始运行的重复审核，应并列审核版本，而非增加实验样本数。</p></section>
    <section><h3>历史环境与审核方法</h3><p>Medium含25条Sim5.1及17条Sim6；Low/High环境版本未在本发布包逐项核实。不同组抽帧策略与审核深度不同。预算模型自述不升级为客观上限证据。</p></section></div>`;
}
function methods(){
  const counts=D.groups.map(g=>`${g.name} ${D.runs.filter(r=>r.group===g.id).length}`).join(" · ");
  const own=D.groups.filter(g=>g.source==="本批批准分析");
  const ownNames=own.map(g=>esc(g.name)).join(" · ");
  const partial=own.filter(g=>g.audit==="partial").map(g=>`${esc(g.name)} ${g.completed}/${g.planned}`).join("、");
  return `<div class="methods"><div class="notice green">独立研究预览。没有提交或覆盖原行为看板；用户授权将程序校验通过的补分析统一纳入统计，真实复核状态逐项保留。</div>
    <h2>01 / 数据范围</h2><p>${esc(counts)}。本轮实际分析包括 ${ownNames}。6项补分析通过程序校验：5项Main因网络路由失败未批准，Compact最后一项的当前指纹与旧批准记录不一致。这些完成结果统一纳入数值统计，不改变原批准记录。${partial?`原单项批准数量：${partial}。`:""}单项批准与整批最终验收分别记录。O1 Standard为persistent-cap20-o1，与O1 Compact的persistent-cap20-o1-compact是独立配置。历史 Medium、Semantic EEF、Action Horizon、EEF Sequence来自公开行为看板；O23 Compact和O23 DepthPro为阶段性公开数据。</p>
    <p>Low/High来源观察：${esc(D.audit_observed)}；O1 Compact与O456 Clear来源观察：${esc(D.o_audit_observed)}；O1 Standard来源观察：${esc(D.o1_standard_audit_observed)}；补分析快照：${esc(D.completion_observed||"尚未发布")}；网页生成：${esc(D.built_at)}。</p>
    <h3>来源分类</h3><div class="table-wrap"><table><thead><tr><th>来源</th><th>实验组</th><th>说明</th></tr></thead><tbody>
      <tr><td>本次实际分析</td><td>${ownNames}</td><td class="reason">本轮行为分析输出；O配置按单项复核状态标注。固定四组结论暂不包含新增O1 Standard。</td></tr>
      <tr><td>历史公开数据</td><td>历史 Medium · Semantic EEF · Action Horizon · EEF Sequence</td><td class="reason">从公开行为看板导入，未在本轮重新分析。</td></tr>
      <tr><td>阶段性公开数据</td><td>O23 Compact · O23 DepthPro</td><td class="reason">公开看板中的阶段性结果，未在本轮重新分析。</td></tr>
    </tbody></table></div>
    <h3>缺失分析</h3>${D.missing.length?`<div class="table-wrap"><table><thead><tr><th>配置</th><th>任务条件</th><th>原因</th></tr></thead><tbody>${D.missing.map(r=>`<tr><td>${esc(group(r.group).name)}</td><td>${esc(r.task)}<span class="cell-sub">${esc(r.variant)} / seed${r.seed} / scene${r.scene}</span></td><td class="reason">${esc(r.reason)}</td></tr>`).join("")}</tbody></table></div>`:"<p>8组分析样本均已收录42项，无缺失分析记录。未知指标仍保留为空值。</p>"}
    <h2>02 / 计算口径</h2><ul>
      <li>共同可比样本：同一task、variant、seed、scene在所选每组均存在，且该项指标符合当前证据筛选。每项指标分别求交集。</li>
      <li>成功率 = 原生success之和 / success有效N；平均得分为任务记录的算术平均。未生成五能力等权总分，能力权重映射在本包未核实。</li>
      <li>计数展示合计、均值、中位数、四分位数、样本标准差、范围和非零任务数。n=0显示空值，n=1不估算样本标准差。</li>
      <li>配对差值 = 后一组 − 前一组；差值列独立取这两组有效交集。增加、减少只表示数值方向，不统一解释为好坏。</li>
      <li>visual confirmed / zero_confirmed统一映射为确认下界，原状态保留。候选事件不计入数值；self_report_confirmed预算项在本版不进入客观比较。</li>
      <li>未将空夹与重抓不同分母相除，未将重叠事件相加为总失败率；不从决策或控制步推算费用、token、CPU时间。</li>
      <li>单次首轮对照，不提供多seed稳定性或因果显著性结论。相关行为多不自动等于行为更好。</li>
    </ul>
    <h2>03 / 证据边界</h2><p>已批准是分析结果的审核状态，不是机器人成功。视频帧与决策未精确同步时，保留时间/帧位置，不补造精确对应。Low/High公开包仅包含审核后的指标理由、视觉证据摘要和SHA，不包含会话、原始模型推理、认证内容或本地路径。其视频未随此预览上传。</p>
    <p>O1 Compact、O456 Clear和O1 Standard保留原公开三视角视频链接、审核事件及当前复核指纹。历史Medium视频链接来自原公开提交。视频均由原云盘提供，本页未重新上传；外部链接可用性不由本网站保证。其他历史配置的完整事件仍在原报告。</p>
    <h2>04 / 来源与下载</h2><div class="download-list"><a class="button" href="data.json" download>${icon("download")}脱敏数据 JSON</a><button class="button" id="download-all">${icon("download")}全量指标 CSV</button><a class="button" href="https://na-wen.github.io/robodojo-board/protocol.md" target="_blank" rel="noopener">${icon("file-text")}原指标协议</a><a class="button" href="https://github.com/sxw1174/robot-audit-comparison" target="_blank" rel="noopener">${icon("github")}页面源码</a></div>
    <p>脱敏数据不是原始审核JSON的逐字节副本。每条本批记录保留原始分析SHA及输入文件SHA；页面使用同一份数据生成表格和下载。所有原始私有文件保持不变。</p>
    <div class="table-wrap"><table><thead><tr><th>输入来源</th><th>SHA-256</th></tr></thead><tbody>${D.inputs.map(x=>`<tr><td>${esc(x.name)}</td><td class="hash">${x.sha256}</td></tr>`).join("")}</tbody></table></div>
    <h2>05 / 来源声明</h2><p>历史与其他配置数据来源于NA-Wen的RoboDojo行为看板，原始实验来源于RoboDojo L3项目。本页面为独立对照原型，不代表原看板维护者的发布或批准。UI图标使用Lucide 0.468.0，许可证见仓库LUCIDE-LICENSE。</p></div>`;
}
function openDialog(title,html){
  $("detail-label").textContent=title;$("detail-body").innerHTML=html;
  if(!$("detail").open)$("detail").showModal();
  $("detail").scrollTop=0;refreshIcons();
}
function currentProofState(findingId){
  return Current.fixed.find(f=>f.id===findingId)?.scope||Current.scope;
}
function metricDetail(field,fixedProof=false,currentProof=false,findingId=""){
  const detailState=currentProof?currentProofState(findingId):fixedProof?F.scope:state,detailData=fixedProof?A.data:D;
  const m=metric(field),summaries=C.summaries(detailData,detailState,field),ids=C.selectedPair(detailState),p=ids?C.pair(detailData,detailState,field,...ids):null;
  const raw=C.rowsFor(detailData,detailState),keys=[...new Set(raw.map(r=>r.task))].sort(),eligibleKeys=new Set(C.eligible(detailData,detailState,field).map(C.key));
  const taskScope = currentProof ? `data-current-proof="true" data-current-finding="${esc(findingId)}"` : fixedProof ? 'data-fixed-proof="true"' : "";
  openDialog(`${m.id} ${m.label}`,`<h2 class="detail-title">${esc(m.label)}</h2><p class="metric-definition">${esc(m.definition)}</p>
    <p class="detail-meta">单位 ${m.unit} · ${currentProof?`${detailState.groups.map(id=>esc(displayName(group(id)))).join(" / ")} · 结论证据 · 本指标共同有效N`:fixedProof?"固定四组结论证据 · 40个共同任务 · 本指标逐项有效N":detailState.scope==="common"?"所选组共同有效子集":"各组独立有效子集"} · ${detailState.policy==="bounds"?"含确认下界":"仅已确认"}</p>
    <div class="table-wrap"><table><thead><tr><th>实验</th><th>N / 范围N</th><th>合计</th><th>均值</th><th>中位数</th><th>样本SD</th><th>Q1–Q3</th><th>最小–最大</th><th>非零任务</th><th>下界N</th></tr></thead><tbody>
      ${summaries.map(s=>`<tr><td>${groupName(s.group)}</td><td>${s.n} / ${s.rawN}</td><td>${fmt(s.total)}</td><td>${fmt(s.mean,3)}</td><td>${fmt(s.median)}</td><td>${fmt(s.sd)}</td><td>${fmt(s.q1)}–${fmt(s.q3)}</td><td>${fmt(s.min)}–${fmt(s.max)}</td><td>${s.n?`${s.nonzero} / ${s.n}`:"—"}</td><td>${s.bounds}</td></tr>`).join("")}
    </tbody></table></div>
    ${p?`<p class="notice green" style="margin-top:18px">${pairLabel(ids)}：有效 ${p.n} 对，平均差 ${signed(p.mean)}，中位差 ${signed(p.median)}；减少 ${p.less} / 持平 ${p.equal} / 增加 ${p.more}。这是两组子集，可能与所选多组共同N不同。</p>`:""}
    <div class="detail-section"><h3>逐任务原始数值与状态</h3><div class="table-wrap"><table><thead><tr><th>任务</th>${detailState.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}</tr></thead><tbody>${keys.map(task=>{const base=raw.find(r=>r.task===task);return `<tr><td><button class="text-button" data-task="${esc(task)}" ${taskScope}>${esc(task)}</button>${detailState.scope==="common"&&!eligibleKeys.has(C.key(base))?'<span class="cell-sub">本指标未纳入共同统计</span>':""}</td>${detailState.groups.map(g=>{const r=raw.find(r=>r.group===g&&r.task===task),v=r?.metrics[field];return `<td>${v?`${fmt(v.value)}${v.status==="lower_bound"?"†":""}<span class="cell-sub">${statusBadge(v.status)}</span>`:"缺失"}</td>`}).join("")}</tr>`}).join("")}</tbody></table></div></div>`);
}
function taskDetail(task,fixedProof=false,currentProof=false,findingId=""){
  const detailState=currentProof?currentProofState(findingId):fixedProof?F.scope:state;
  const rows=C.rowsFor(fixedProof?A.data:D,{...detailState,task});
  const missing=D.missing.filter(r=>r.task===task&&detailState.groups.includes(r.group)&&(!detailState.variant||r.variant===detailState.variant));
  openDialog(task,`<h2 class="detail-title">${esc(task)}</h2><p class="detail-meta">同名任务逐运行保留；完整条件列于各组来源。</p>
    <div class="table-wrap"><table><thead><tr><th>26项指标</th>${rows.map(r=>`<th>${groupName(r.group)}<span class="cell-sub">${r.variant} / s${r.seed} / scene${r.scene}</span></th>`).join("")}</tr></thead><tbody>${D.metrics.map(m=>`<tr><td>${m.id} ${m.label}</td>${rows.map(r=>{const v=r.metrics[m.key];return `<td>${fmt(v.value)}${v.status==="lower_bound"?"†":""}<span class="cell-sub">${statusBadge(v.status)}</span></td>`}).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="detail-section"><h3>来源与事件</h3>${rows.map(r=>`<div class="finding"><h3>${groupName(r.group)} ${statusBadge(r.audit)}</h3><p class="hash">${esc(r.id)}</p><p>${r.events.length}条已导入事件 · ${esc(r.config.simulator||"环境版本见源配置")}</p><button class="button" data-run="${esc(r.id)}">来源、指标理由与事件 ${icon("arrow-right")}</button></div>`).join("")}</div>
    ${missing.map(r=>`<p class="notice">${esc(group(r.group).name)} ${esc(r.task)}：${esc(r.reason)}</p>`).join("")}`);
}
function findingDetail(id){
  const f=F.fixed.find(f=>f.id===id);if(!f)return;
  openDialog(f.title,`<h2 class="detail-title">${esc(f.title)}</h2><p>${esc(f.text)}</p>
    <p class="detail-meta">固定四组首轮 · ${esc(f.review)} · 任务举例不是全部统计分母</p>
    <div class="conclusion-sources">${proofLinks(f.fields)}</div><div class="detail-section"><h3>对应任务与来源</h3>${proofTasks(f.tasks)}</div>
    <a class="text-button" href="#analysis" data-close-detail="true">完整四组分析 ${icon("arrow-right")}</a>`);
}
function runDetail(id,eventId){
  const r=D.runs.find(r=>r.id===id),g=group(r.group);if(!r)return;
  const events=eventId?r.events.filter(e=>e.id===eventId):r.events;
  openDialog(`${g.name} / ${r.task}`,`<h2 class="detail-title">${esc(r.task)} · ${esc(g.name)}</h2><p class="detail-meta">${r.variant} / seed${r.seed} / scene${r.scene} · ${statusBadge(r.audit)}</p><p class="hash">${esc(r.id)}</p>
    ${r.summary?`<div class="detail-section"><h3>审核摘要</h3><p>${esc(r.summary)}</p></div>`:""}
    ${r.limitations?.length?`<div class="detail-section"><h3>限制与未知</h3><p>${r.limitations.map(esc).join("<br>")}</p></div>`:""}
    ${r.videos.length?`<div class="media-grid">${r.videos.map(v=>`<div><video controls preload="none" src="${esc(v.url)}" aria-label="${esc(v.camera)}原视频"></video><p>${esc(v.camera)} · <a href="${esc(v.url)}" target="_blank" rel="noopener">原视频</a></p><p class="hash">${v.sha256}</p></div>`).join("")}</div>`:`<p class="notice">此记录没有在本预览中托管视频。以下保留已有事件定位及源帧引用，不显示替代或模拟画面。</p>`}
    <div class="detail-section"><h3>${eventId?"选中事件":"已导入事件"} · ${events.length}</h3>${events.map(e=>`<article class="finding"><h3>${esc(e.id)} ${statusBadge(e.status)}</h3><span class="event-location">${eventLocation(e)}</span><p>${esc(e.result)}</p>${e.visual?`<p class="evidence-text">${esc(e.visual)}</p>`:""}${e.uncertainty?`<p class="evidence-text">范围限制：${esc(e.uncertainty)}</p>`:""}${e.frames.length?`<details><summary>源帧定位 · ${e.frames.length}</summary><p class="hash">${e.frames.map(esc).join(" · ")}</p></details>`:""}${e.source_url?`<a href="${e.source_url}" target="_blank" rel="noopener">公开原事件记录</a>`:""}</article>`).join("")||`<p>本页未导入事件详情。${g.url?`<a href="${g.url}" target="_blank" rel="noopener">查看原报告</a>`:""}</p>`}</div>
    <details class="detail-section" ${eventId?"":"open"}><summary>26项指标与判定理由</summary><div class="table-wrap"><table><thead><tr><th>指标</th><th>数值 / 状态</th><th>原审核理由</th></tr></thead><tbody>${D.metrics.map(m=>{const v=r.metrics[m.key];return `<tr><td>${m.id} ${m.label}</td><td>${fmt(v.value)} ${statusBadge(v.status)}<span class="cell-sub">原状态 ${esc(v.original_status)}</span></td><td class="reason">${esc(v.reason)||"参见原组报告"}</td></tr>`}).join("")}</tbody></table></div></details>
    <div class="detail-section"><h3>来源指纹</h3>${r.source.analysis_sha256?`<p>原分析 SHA-256</p><p class="hash">${r.source.analysis_sha256}</p><p>审核模型历史：${esc(r.source.models.join(" / "))}</p>`:""}
      ${r.source.evidence_fingerprint?`<p>程序完成版本证据指纹</p><p class="hash">${esc(r.source.evidence_fingerprint)}</p><p>程序校验通过；${r.source.review_status==="approval_fingerprint_mismatch"?"Main曾批准旧版本，当前证据指纹与批准记录不一致，不视为当前版本获批。":"Main复核因网络路由失败未批准，原3次失败记录保留。"}用户授权统一纳入统计。</p>`:""}
      ${r.source.recorded_review_fingerprint?`<p>旧版本批准指纹（不代表当前版本）</p><p class="hash">${esc(r.source.recorded_review_fingerprint)}</p>`:""}
      ${r.source.review_fingerprint?`<p>当前批准版本复核指纹</p><p class="hash">${esc(r.source.review_fingerprint)}</p><p>审核effort：${esc(r.source.review_effort)}；机器人：${esc(r.config.model)} / ${esc(r.config.effort)}</p>`:""}
      ${r.source.access?`<p>分析接入：${r.source.access==="codex_subscription"?"服务器Codex订阅账号":"保留的历史批准分析"}；${esc(r.source.sampling_policy||"策略见原审核记录")}</p>`:""}
      ${r.source.files.map(f=>`<p>${esc(f.kind)}${f.url?` · <a href="${esc(f.url)}" target="_blank" rel="noopener">公开原件</a>`:""}<br><span class="hash">${f.sha256}</span></p>`).join("")}${g.url?`<p><a href="${g.url}" target="_blank" rel="noopener">实验组原报告</a></p>`:""}</div>`);
}
function download(name,text,type){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportStats(){
  const rows=[["scope","policy","task_filter","variant_filter","metric_id","metric","group","n","range_n","total","mean","median","sample_sd","q1","q3","min","max","nonzero_n","lower_bound_n"]];
  for(const m of D.metrics)for(const s of C.summaries(D,state,m.key))rows.push([state.scope,state.policy,state.task,state.variant,m.id,m.key,s.group,s.n,s.rawN,s.total,s.mean,s.median,s.sd,s.q1,s.q3,s.min,s.max,s.nonzero,s.bounds]);
  download("robodojo-current-statistics.csv",C.csv(rows),"text/csv;charset=utf-8");
}
function exportAll(){
  const rows=[["group","run_id","task","variant","seed","scene","audit",...D.metrics.flatMap(m=>[m.key,m.key+"_status",m.key+"_original_status"])]];
  for(const r of D.runs)rows.push([r.group,r.id,r.task,r.variant,r.seed,r.scene,r.audit,...D.metrics.flatMap(m=>[r.metrics[m.key].value,r.metrics[m.key].status,r.metrics[m.key].original_status])]);
  download("robodojo-all-run-metrics.csv",C.csv(rows),"text/csv;charset=utf-8");
}
$("task").innerHTML='<option value="">全部任务</option>'+[...new Set(D.runs.map(r=>r.task))].sort().map(t=>`<option>${esc(t)}</option>`).join("");
for(const field of ["scope","task","variant","policy"])$(field).addEventListener("change",e=>{state[field]=e.target.value;local.eventPage=0;render();});
$("reset").onclick=()=>{Object.assign(state,{groups:defaultGroups(),scope:"all",task:"",variant:"",policy:"bounds",includeInterim:false});Object.assign(local,{taskSearch:"",taskSort:"task",taskMetric:"score",eventSearch:"",eventStatus:"",eventMetric:"",eventPage:0});clearTimeout(searchTimer);render();};
$("export").onclick=exportStats;
$("close-detail").onclick=()=>$("detail").close();
$("detail").addEventListener("click",e=>{if(e.target===$("detail")){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
document.addEventListener("change",e=>{
  if(e.target.dataset.group){
    const gid=e.target.dataset.group;
    if(e.target.checked){state.groups.push(gid);if(group(gid).audit==="interim")state.includeInterim=true;}
    else state.groups=state.groups.filter(g=>g!==gid);
    state.groups.sort((a,b)=>D.groups.findIndex(g=>g.id===a)-D.groups.findIndex(g=>g.id===b));render();
  }else if(e.target.id==="include-interim"){
    state.includeInterim=e.target.checked;if(!state.includeInterim)state.groups=state.groups.filter(g=>group(g).audit!=="interim");
    render();
  }else{
    const fields={"task-search":"taskSearch","task-metric":"taskMetric","task-sort":"taskSort","event-search":"eventSearch","event-status":"eventStatus","event-metric":"eventMetric"};
    if(fields[e.target.id]){local[fields[e.target.id]]=e.target.value;local.eventPage=0;render();}
  }
});
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-current-metric],[data-metric],[data-proof-metric],[data-task],[data-run],[data-page],[data-finding-detail],[data-close-detail],#download-all");if(!t)return;
  if(t.dataset.currentMetric)metricDetail(t.dataset.currentMetric,false,true,t.dataset.currentFinding);
  else if(t.dataset.proofMetric)metricDetail(t.dataset.proofMetric,true);
  else if(t.dataset.metric)metricDetail(t.dataset.metric);
  else if(t.dataset.task)taskDetail(t.dataset.task,t.dataset.fixedProof==="true",t.dataset.currentProof==="true",t.dataset.currentFinding);
  else if(t.dataset.run)runDetail(t.dataset.run,t.dataset.event);
  else if(t.dataset.page){local.eventPage+=Number(t.dataset.page);render();$("view").scrollIntoView({block:"start"});}
  else if(t.dataset.findingDetail)findingDetail(t.dataset.findingDetail);
  else if(t.dataset.closeDetail)$("detail").close();
  else if(t.id==="download-all")exportAll();
});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("tr[data-metric],tr[data-proof-metric]")){e.preventDefault();metricDetail(e.target.dataset.metric||e.target.dataset.proofMetric,!!e.target.dataset.proofMetric);}});
let searchTimer;
document.addEventListener("input",e=>{
  const field={"task-search":"taskSearch","event-search":"eventSearch"}[e.target.id];
  if(!field)return;
  clearTimeout(searchTimer);
  const id=e.target.id,value=e.target.value,cursor=e.target.selectionStart;
  searchTimer=setTimeout(()=>{
    local[field]=value;local.eventPage=0;render();
    const input=$(id);if(input){input.focus();input.setSelectionRange(cursor,cursor);}
  },180);
});
window.addEventListener("hashchange",()=>{render();window.scrollTo({top:0});});
render();
