/* All views and downloads share the same metric eligibility functions. */
"use strict";
const D = window.AUDIT_DATA, C = window.AuditCore;
const $ = id => document.getElementById(id);
const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (n, digits = 2) => n == null || !Number.isFinite(n) ? "—" : n.toLocaleString("zh-CN", {maximumFractionDigits: digits});
const signed = n => n == null ? "—" : (n > 0 ? "+" : "") + fmt(n, n !== 0 && Math.abs(n) < .01 ? 4 : 2);
const group = id => D.groups.find(g => g.id === id);
const metric = key => D.metrics.find(m => m.key === key);
const icon = name => `<i data-lucide="${name}"></i>`;
const state = {groups:["low","high"],scope:"common",task:"",variant:"",policy:"bounds",includeInterim:false};
const local = {taskSearch:"", taskSort:"task", taskMetric:"score", eventSearch:"", eventStatus:"", eventMetric:"", eventPage:0};
const titles = {
  overview:["实验总览","实验总览","首轮行为分析 · Low / High"],
  metrics:["指标统计","指标统计","26项指标 · 结果、夹取、恢复、换手、观察与操作误差"],
  tasks:["任务对照","任务对照","task / variant / seed / scene"],
  evidence:["事件证据","事件证据","视觉事件、帧定位与来源指纹"],
  relations:["实验配置","实验配置","方法设置、运行环境与历史来源"],
  methods:["数据与方法","数据与方法","数据范围、统计口径与来源"],
};
function route(){return Object.hasOwn(titles,location.hash.slice(1))?location.hash.slice(1):"overview";}
function groupName(id){const g=group(id);return `<span class="group-name"><span class="swatch" style="background:${g.color}"></span>${esc(g.name)}</span>`;}
function statusBadge(status){
  const labels={confirmed:"已确认",lower_bound:"确认下界",unknown:"未知",na:"未覆盖",pending:"待审核",self_report:"仅自述",
    approved:"已批准",partial:"部分完成",complete:"程序完成",needs_attention:"需关注",interim:"阶段性",logs_images:"日志与图像核查",uncertain:"待确认",candidate:"候选"};
  return `<span class="badge ${["pending","partial","needs_attention","interim","self_report","uncertain","candidate"].includes(status)?"warn":["unknown","na"].includes(status)?"muted":""}">${esc(labels[status]||status)}</span>`;
}
function section(n,title,sub="",link=""){
  return `<div class="section-head"><div><h2><span class="section-number">${n}</span>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>${link}</div>`;
}
function chip(g){
  const suffix=g.audit==="interim"?"阶段性":g.audit==="partial"?`${g.completed}/${g.planned}`:"";
  return `<label class="group-chip" style="--group-color:${g.color}"><input type="checkbox" data-group="${g.id}" ${state.groups.includes(g.id)?"checked":""}><span class="swatch"></span>${esc(g.name)}${suffix?`<small>${esc(suffix)}</small>`:""}</label>`;
}
function pairIds(){return state.groups.includes("low")&&state.groups.includes("high")?["low","high"]:state.groups.length>1?[state.groups[0],state.groups[state.groups.length-1]]:null;}
function pairLabel(ids){return ids?`${esc(group(ids[1]).name)} − ${esc(group(ids[0]).name)}`:"至少选择两组";}
function refreshIcons(){if(window.lucide)window.lucide.createIcons();}
function renderFilters(){
  $("group-picker").innerHTML=D.groups.filter(g=>["low","high","o1compact","o456"].includes(g.id)).map(chip).join("");
  $("extra-groups").innerHTML=`<p class="caption">历史配置参照</p><div class="group-picker">${D.groups.filter(g=>!["low","high","o1compact","o456"].includes(g.id)).map(chip).join("")}</div>
    <label class="inline-check"><input type="checkbox" id="include-interim" ${state.includeInterim?"checked":""}>纳入阶段性结果</label>`;
  $("scope").value=state.scope;$("task").value=state.task;$("variant").value=state.variant;$("policy").value=state.policy;
  const raw=C.rowsFor(D,state), sets=C.summaries(D,state,"score"), min=Math.min(...sets.map(s=>s.n));
  $("scope-summary").innerHTML=`<strong>${raw.length}</strong> 条范围内记录 · ${state.scope==="common"?`得分共同有效 <strong>${min}</strong> 组任务条件`:"各组独立分母"} · seed 0 / scene 0 · 行为指标逐项重算有效 N${state.policy==="bounds"?" · † 表示纳入确认下界":""}`;
}
function render(){
  const page=route(),[name,title,sub]=titles[page];
  $("breadcrumb").textContent=name;$("page-title").textContent=title;$("page-subtitle").textContent=sub;
  if(page==="overview"){
    $("page-subtitle").textContent=state.groups.map(id=>group(id).name).join(" · ");
  }
  document.querySelectorAll(".sidebar nav a").forEach(a=>a.classList.toggle("active",a.hash==="#"+page));
  renderFilters();
  $("view").innerHTML=({overview,metrics,tasks,evidence,relations,methods}[page])();
  refreshIcons();
}
function overview(){
  const fields=["success","score","turns","actions"];
  const kpis=fields.map(field=>{
    const def=metric(field), summaries=C.summaries(D,state,field);
    return `<div class="kpi"><h3>${def.label==="成功"?"原生成功率":def.label==="得分"?"任务等权均分":def.label}</h3>${summaries.map(s=>
      `<div class="kpi-value">${groupName(s.group)}<strong>${s.n?(field==="success"?fmt(s.mean*100,1)+"%":fmt(s.mean,field==="score"?3:1)):"—"}</strong></div>
       <small>${esc(group(s.group).name)} · ${field==="success"?`${fmt(s.total,0)} / ${s.n} 成功`:`n=${s.n}${field==="turns"||field==="actions"?" · 合计 "+fmt(s.total,0):""}`}</small>`).join("")}</div>`;
  }).join("");
  const sums=C.summaries(D,state,"score");
  const bars=sums.map(s=>{
    const vals=s.rows.map(r=>r.metrics.score.value), zero=vals.filter(v=>v===0).length, full=vals.filter(v=>v===1).length, partial=s.n-zero-full;
    return `<div class="chart-group"><div class="chart-group-header">${groupName(s.group)}<span>零分 ${zero} · 部分 ${partial} · 满分 ${full}</span></div>
      <div class="bar-stack" role="img" aria-label="${esc(group(s.group).name)}：零分${zero}，部分得分${partial}，满分${full}">${s.n?
      `<span class="zero" style="width:${zero/s.n*100}%"></span><span class="partial" style="width:${partial/s.n*100}%"></span><span class="full" style="width:${full/s.n*100}%"></span>`:""}</div></div>`;
  }).join("");
  const ids=pairIds(), conclusions=window.AuditFindings.build(D,state,ids);
  const findings=conclusions.length?`<div class="conclusion-list">${conclusions.map((f,i)=>`<article class="conclusion" data-finding="${f.id}">
    <div class="conclusion-number">${String(i+1).padStart(2,"0")}</div><div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p>
    <div class="conclusion-sources">${f.fields.map(field=>`<button class="text-button" data-proof-metric="${field}" data-pair-a="${ids[0]}" data-pair-b="${ids[1]}">${metric(field).id} ${esc(metric(field).label)} ${icon("arrow-up-right")}</button>`).join("")}</div></div>
    </article>`).join("")}</div>`:'<div class="empty">当前范围没有足够的两组配对证据，未生成结论。</div>';
  const top=ids?C.pair(D,state,"score",...ids).pairs.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,6):[];
  return `${state.groups.some(id=>!["low","high"].includes(id))?'<div class="notice">已选择其他配置或历史参照。不同配置可能存在模型、模拟器或审核流程差异，组间差异不能仅归因于effort。</div>':""}
    ${section("01","主要结论",ids?`${pairLabel(ids)} · 当前任务筛选下的两组有效配对 · 各指标独立分母`:"")}
    <p class="conclusion-scope">${state.groups.map(id=>`${esc(group(id).name)} ${D.runs.filter(r=>r.group===id).length}/${group(id).planned}`).join(" · ")}。视觉计数为已核查覆盖内的确认下界，以下为首轮样本的描述性结果。</p>
    ${state.groups.some(id=>["o1compact","o456"].includes(id))?'<div class="notice">O1 Compact 40/42、O456 Clear 41/42项程序校验且当前复核批准；整批最终验收未完成。缺失项不纳入任何指标或事件统计。</div>':""}
    ${findings}
    ${section("02","结果统计","原生结果与执行记录")}
    <div class="kpi-grid">${kpis}</div>
    ${section("03","得分分布","原生得分；部分得分指 0 < score < 1")}
    <div class="chart-area">${bars}<div class="bar-legend"><span class="legend-item"><i class="swatch" style="background:#ccd4d0"></i>零分</span><span class="legend-item"><i class="swatch" style="background:#b2c8b9"></i>部分得分</span><span class="legend-item"><i class="swatch" style="background:#447d62"></i>满分</span></div></div>
    ${section("04","任务得分差异",ids?`${pairLabel(ids)} · 按绝对得分差排序`:"",'<a href="#tasks">全部任务 '+icon("arrow-right")+"</a>")}
    <div class="table-wrap"><table><thead><tr><th>任务</th><th>${ids?esc(group(ids[0]).name):"组A"}</th><th>${ids?esc(group(ids[1]).name):"组B"}</th><th>得分差</th><th>证据</th></tr></thead><tbody>${top.map(p=>
      `<tr><td><span class="task-name">${esc(p.left.task)}</span><span class="cell-sub">${esc(p.left.variant)} · s${p.left.seed} / scene${p.left.scene}</span></td><td>${fmt(p.left.metrics.score.value)}</td><td>${fmt(p.right.metrics.score.value)}</td><td>${signed(p.delta)}</td><td><button class="icon-button" data-task="${esc(p.left.task)}" title="查看任务对照" aria-label="查看${esc(p.left.task)}任务对照">${icon("arrow-up-right")}</button></td></tr>`).join("")||'<tr><td colspan="5">当前范围无有效配对。</td></tr>'}</tbody></table></div>
    ${section("05","行为指标",state.policy==="bounds"?"† 为已声明覆盖内的确认下界；不同指标有效N可能不同":"仅已确认数值",'<a href="#metrics">全部26项 '+icon("arrow-right")+"</a>")}
    ${metricTable(["empty_retry","drop","empty_regrasp","view_opposite","fine_placement_fail"])}`;
}
function metricCell(s,field){
  return s.n?`<span class="value">${fmt(s.mean,field==="score"?3:2)}${s.bounds?"†":""}</span><span class="cell-sub">n=${s.n} · 合计 ${fmt(s.total)}</span>`:'<span class="muted">—</span><span class="cell-sub">n=0</span>';
}
function metricTable(keys,sections=false){
  let last="";const ids=pairIds();
  const rows=keys.map(key=>{
    const m=metric(key),sets=C.summaries(D,state,key),p=ids?C.pair(D,state,key,...ids):null;
    const header=sections&&last!==m.section?`<tr class="section-row"><td colspan="${state.groups.length+3}">${esc(m.section)}</td></tr>`:"";last=m.section;
    return header+`<tr class="click-row" data-metric="${key}" tabindex="0" role="button" aria-label="查看${esc(m.label)}统计">
      <td><span class="metric-name"><span class="metric-id">${m.id}</span>${esc(m.label)}</span><span class="cell-sub">单位：${m.unit} · 单格为均值</span></td>
      ${sets.map(s=>`<td>${metricCell(s,key)}</td>`).join("")}<td>${p?.n?signed(p.mean):"—"}<span class="cell-sub">${p?`n=${p.n}`:""}</span></td>
      <td>${p?.n?`${p.less} / ${p.equal} / ${p.more}`:"—"}<span class="cell-sub">减少 / 持平 / 增加</span></td></tr>`;
  }).join("");
  return `<div class="table-wrap sticky-table"><table><thead><tr><th>指标</th>${state.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}<th>${pairLabel(ids)}</th><th>配对方向</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function metrics(){
  return `<div class="notice green">所有26项均保留。视觉零值表示覆盖范围内未确认发现；未知、未覆盖、待审核不进入数值分母。† 与精确计数分别保留。</div>
    ${metricTable(D.metrics.map(m=>m.key),true)}<p class="caption">差值与方向列使用所标明的两组共同有效子集；不要求第三组存在。主表各组均值遵循顶部统计范围。</p>`;
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
    <label class="control-label">展示指标<select id="task-metric">${options}</select></label><label class="control-label">排序<select id="task-sort"><option value="task">任务名称</option><option value="delta" ${local.taskSort==="delta"?"selected":""}>差异绝对值</option></select></label></div>
    <p class="caption">完整任务清单 · ${all.length}组条件 · 灰色标记表示未进入当前指标的共同统计；缺失项仍保留。</p>
    <div class="table-wrap"><table><thead><tr><th>任务 / 条件</th>${state.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}<th>${pairLabel(ids)}</th><th>详情</th></tr></thead><tbody>
    ${all.map(({base,entries})=>`<tr><td><span class="task-name">${esc(base.task)}</span><span class="cell-sub">${esc(base.variant)} · seed${base.seed} / scene${base.scene}${!validKeys.has(C.key(base))?" · 未纳入":""}</span></td>
      ${state.groups.map(g=>{const r=entries[g],v=r?.metrics[field];return `<td>${v?`<span class="value">${fmt(v.value)}${v.status==="lower_bound"?"†":""}</span><span class="cell-sub">${statusBadge(v.status)}</span>`:`<span class="badge warn">${g==="high"&&base.task==="push_T"?"分析缺失":"无记录"}</span>`}</td>`}).join("")}
      <td>${signed(delta({entries}))}</td><td><button class="icon-button" data-task="${esc(base.task)}" title="查看任务详情" aria-label="查看${esc(base.task)}">${icon("arrow-up-right")}</button></td></tr>`).join("")||`<tr><td colspan="${state.groups.length+3}">无匹配任务</td></tr>`}</tbody></table></div>
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
  return `<div class="notice">配置名录不受任务筛选影响。历史Medium已核实全部42条为medium；没有将其改名为新复现实验。</div>
    <div class="compare-strip">${["low","persistent","high"].map(id=>{const g=group(id);return `<div class="compare-item" style="--group-color:${g.color}">${groupName(id)}<p>persistent-cap20</p><strong>${D.runs.filter(r=>r.group===id).length}<small> / 42</small></strong><p>${id==="persistent"?"历史首轮 · Sim5.1 / Sim6":id==="high"?"批准分析 · push_T缺失":"批准分析 · 首轮"}</p></div>`}).join("")}</div>
    ${section("01","完整配置名录","同一配置族不等于同一运行；不同配置的成绩差异不是纯effort效应")}
    <div class="table-wrap"><table class="relationship-table"><thead><tr><th>实验</th><th>配置族 / effort</th><th>状态</th><th>对应关系与限制</th><th>来源</th></tr></thead><tbody>
      ${D.groups.map(g=>`<tr><td>${groupName(g.id)}<span class="cell-sub">${g.completed!=null?`${g.completed}/${g.planned} 项复核批准 · `:""}${D.runs.filter(r=>r.group===g.id).length} 条运行</span></td><td>${esc(g.family)}<span class="cell-sub">${esc(g.effort)} · ${esc(g.model)}</span></td><td>${statusBadge(g.audit)}</td><td class="reason">${esc(g.relation)}</td><td>${g.url?`<a href="${g.url}" target="_blank" rel="noopener">原报告 ${icon("arrow-up-right")}</a>`:'<a href="#methods">本批来源</a>'}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="relation-notes"><section><h3>运行身份与重复统计</h3><p>已导入${D.runs.length}条记录的run_id互不重复。名称相同的任务按task、variant、seed、scene匹配；这不是源文件哈希级的全库去重证明。若后续确认同一原始运行的重复审核，应并列审核版本，而非增加实验样本数。</p></section>
    <section><h3>历史环境与审核方法</h3><p>Medium含25条Sim5.1及17条Sim6；Low/High环境版本未在本发布包逐项核实。不同组抽帧策略与审核深度不同。预算模型自述不升级为客观上限证据。</p></section></div>`;
}
function methods(){
  const counts=D.groups.map(g=>`${g.name} ${D.runs.filter(r=>r.group===g.id).length}`).join(" · ");
  return `<div class="methods"><div class="notice green">v0.1 独立研究预览。没有提交或覆盖原行为看板，也没有为此页面重新运行模型。</div>
    <h2>01 / 数据范围</h2><p>${esc(counts)}。Low42、High41份为已批准分析；O1 Compact与O456 Clear分别有40/42、41/42项程序校验且当前复核批准，整批最终验收未完成。历史Medium42条来自公开提交；两种O23仍保留阶段性标识。</p>
    <p>Low/High来源观察：${esc(D.audit_observed)}；O配置来源观察：${esc(D.o_audit_observed)}；网页生成：${esc(D.built_at)}。页面不会自动轮询实验状态。</p>
    <h3>缺失分析</h3><div class="table-wrap"><table><thead><tr><th>配置</th><th>任务条件</th><th>原因</th></tr></thead><tbody>${D.missing.map(r=>`<tr><td>${esc(group(r.group).name)}</td><td>${esc(r.task)}<span class="cell-sub">${esc(r.variant)} / seed${r.seed} / scene${r.scene}</span></td><td class="reason">${esc(r.reason)}</td></tr>`).join("")}</tbody></table></div>
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
    <p>O1 Compact和O456 Clear保留原公开三视角视频链接、审核事件及当前复核指纹。历史Medium视频链接来自原公开提交。视频均由原云盘提供，本页未重新上传；外部链接可用性不由本网站保证。其他历史配置的完整事件仍在原报告。</p>
    <h2>04 / 来源与下载</h2><div class="download-list"><a class="button" href="data.json" download>${icon("download")}脱敏数据 JSON</a><button class="button" id="download-all">${icon("download")}全量指标 CSV</button><a class="button" href="https://na-wen.github.io/robodojo-board/protocol.md" target="_blank" rel="noopener">${icon("file-text")}原指标协议</a><a class="button" href="https://github.com/sxw1174/robot-audit-comparison" target="_blank" rel="noopener">${icon("github")}页面源码</a></div>
    <p>脱敏数据不是原始审核JSON的逐字节副本。每条本批记录保留原始分析SHA及输入文件SHA；页面使用同一份数据生成表格和下载。所有原始私有文件保持不变。</p>
    <div class="table-wrap"><table><thead><tr><th>输入来源</th><th>SHA-256</th></tr></thead><tbody>${D.inputs.map(x=>`<tr><td>${esc(x.name)}</td><td class="hash">${x.sha256}</td></tr>`).join("")}</tbody></table></div>
    <h2>05 / 原Low–High配对概览</h2><p>以下为原报告固定41对的核心结果图，仅包含原生指标；不随页面筛选变化。</p><img class="methods-image" src="low-high-original-overview.png" alt="原报告41对Low与High任务的成功率、平均得分、决策次数和实际控制步统计" loading="lazy">
    <h2>06 / 来源声明</h2><p>历史与其他配置数据来源于NA-Wen的RoboDojo行为看板，原始实验来源于RoboDojo L3项目。本页面为独立对照原型，不代表原看板维护者的发布或批准。UI图标使用Lucide 0.468.0，许可证见仓库LUCIDE-LICENSE。</p></div>`;
}
function openDialog(title,html){
  $("detail-label").textContent=title;$("detail-body").innerHTML=html;
  if(!$("detail").open)$("detail").showModal();
  $("detail").scrollTop=0;refreshIcons();
}
function metricDetail(field,proofIds=null){
  const detailState=proofIds?{...state,groups:proofIds,scope:"common"}:state;
  const m=metric(field),summaries=C.summaries(D,detailState,field),ids=proofIds||pairIds(),p=ids?C.pair(D,detailState,field,...ids):null;
  const raw=C.rowsFor(D,detailState),keys=[...new Set(raw.map(r=>r.task))].sort();
  openDialog(`${m.id} ${m.label}`,`<h2 class="detail-title">${esc(m.label)}</h2><p class="metric-definition">${esc(m.definition)}</p>
    <p class="detail-meta">单位 ${m.unit} · ${detailState.scope==="common"?"所选组共同有效子集":"各组独立有效子集"} · ${state.policy==="bounds"?"含确认下界":"仅已确认"}</p>
    <div class="table-wrap"><table><thead><tr><th>实验</th><th>N / 范围N</th><th>合计</th><th>均值</th><th>中位数</th><th>样本SD</th><th>Q1–Q3</th><th>最小–最大</th><th>非零任务</th><th>下界N</th></tr></thead><tbody>
      ${summaries.map(s=>`<tr><td>${groupName(s.group)}</td><td>${s.n} / ${s.rawN}</td><td>${fmt(s.total)}</td><td>${fmt(s.mean,3)}</td><td>${fmt(s.median)}</td><td>${fmt(s.sd)}</td><td>${fmt(s.q1)}–${fmt(s.q3)}</td><td>${fmt(s.min)}–${fmt(s.max)}</td><td>${s.n?`${s.nonzero} / ${s.n}`:"—"}</td><td>${s.bounds}</td></tr>`).join("")}
    </tbody></table></div>
    ${p?`<p class="notice green" style="margin-top:18px">${pairLabel(ids)}：有效 ${p.n} 对，平均差 ${signed(p.mean)}，中位差 ${signed(p.median)}；减少 ${p.less} / 持平 ${p.equal} / 增加 ${p.more}。这是两组子集，可能与三组共同N不同。</p>`:""}
    <div class="detail-section"><h3>逐任务原始数值与状态</h3><div class="table-wrap"><table><thead><tr><th>任务</th>${detailState.groups.map(g=>`<th>${groupName(g)}</th>`).join("")}</tr></thead><tbody>${keys.map(task=>`<tr><td><button class="text-button" data-task="${esc(task)}">${esc(task)}</button></td>${detailState.groups.map(g=>{const r=raw.find(r=>r.group===g&&r.task===task),v=r?.metrics[field];return `<td>${v?`${fmt(v.value)}${v.status==="lower_bound"?"†":""}<span class="cell-sub">${statusBadge(v.status)}</span>`:"缺失"}</td>`}).join("")}</tr>`).join("")}</tbody></table></div></div>`);
}
function taskDetail(task){
  const rows=D.runs.filter(r=>r.task===task&&state.groups.includes(r.group)&&(!state.variant||r.variant===state.variant));
  openDialog(task,`<h2 class="detail-title">${esc(task)}</h2><p class="detail-meta">同名任务逐运行保留；完整条件列于各组来源。</p>
    <div class="table-wrap"><table><thead><tr><th>26项指标</th>${rows.map(r=>`<th>${groupName(r.group)}<span class="cell-sub">${r.variant} / s${r.seed} / scene${r.scene}</span></th>`).join("")}</tr></thead><tbody>${D.metrics.map(m=>`<tr><td>${m.id} ${m.label}</td>${rows.map(r=>{const v=r.metrics[m.key];return `<td>${fmt(v.value)}${v.status==="lower_bound"?"†":""}<span class="cell-sub">${statusBadge(v.status)}</span></td>`}).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="detail-section"><h3>来源与事件</h3>${rows.map(r=>`<div class="finding"><h3>${groupName(r.group)} ${statusBadge(r.audit)}</h3><p class="hash">${esc(r.id)}</p><p>${r.events.length}条已导入事件 · ${esc(r.config.simulator||"环境版本见源配置")}</p><button class="button" data-run="${esc(r.id)}">来源、指标理由与事件 ${icon("arrow-right")}</button></div>`).join("")}</div>
    ${task==="push_T"&&state.groups.includes("high")?'<p class="notice">High push_T分析缺失：413限制；没有用零值替代。</p>':""}`);
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
      ${r.source.review_fingerprint?`<p>当前批准版本复核指纹</p><p class="hash">${esc(r.source.review_fingerprint)}</p><p>审核effort：${esc(r.source.review_effort)}；机器人：${esc(r.config.model)} / ${esc(r.config.effort)}</p>`:""}
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
$("reset").onclick=()=>{Object.assign(state,{groups:["low","high"],scope:"common",task:"",variant:"",policy:"bounds",includeInterim:false});Object.assign(local,{taskSearch:"",taskSort:"task",taskMetric:"score",eventSearch:"",eventStatus:"",eventMetric:"",eventPage:0});clearTimeout(searchTimer);render();};
$("other-groups").onclick=()=>{$("extra-groups").hidden=!$("extra-groups").hidden;};
$("export").onclick=exportStats;
$("close-detail").onclick=()=>$("detail").close();
$("detail").addEventListener("click",e=>{if(e.target===$("detail")){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
document.addEventListener("change",e=>{
  if(e.target.dataset.group){
    const gid=e.target.dataset.group;
    if(e.target.checked){state.groups.push(gid);if(group(gid).audit==="interim")state.includeInterim=true;}
    else state.groups=state.groups.filter(g=>g!==gid);
    if(!state.groups.length)state.groups=["low"];
    state.groups.sort((a,b)=>D.groups.findIndex(g=>g.id===a)-D.groups.findIndex(g=>g.id===b));render();
  }else if(e.target.id==="include-interim"){
    state.includeInterim=e.target.checked;if(!state.includeInterim)state.groups=state.groups.filter(g=>group(g).audit!=="interim");
    if(!state.groups.length)state.groups=["low"];render();
  }else{
    const fields={"task-search":"taskSearch","task-metric":"taskMetric","task-sort":"taskSort","event-search":"eventSearch","event-status":"eventStatus","event-metric":"eventMetric"};
    if(fields[e.target.id]){local[fields[e.target.id]]=e.target.value;local.eventPage=0;render();}
  }
});
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-metric],[data-proof-metric],[data-task],[data-run],[data-page],#download-all");if(!t)return;
  if(t.dataset.proofMetric)metricDetail(t.dataset.proofMetric,[t.dataset.pairA,t.dataset.pairB]);
  else if(t.dataset.metric)metricDetail(t.dataset.metric);
  else if(t.dataset.task)taskDetail(t.dataset.task);
  else if(t.dataset.run)runDetail(t.dataset.run,t.dataset.event);
  else if(t.dataset.page){local.eventPage+=Number(t.dataset.page);render();$("view").scrollIntoView({block:"start"});}
  else if(t.id==="download-all")exportAll();
});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("tr[data-metric]")){e.preventDefault();metricDetail(e.target.dataset.metric);}});
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
