const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
const F = require("./findings.js");
const D = JSON.parse(fs.readFileSync("data.json","utf8"));
const tests=[];
function test(name,fn){fn();tests.push(name);console.log("PASS",name);}
const state={groups:["low","persistent","high"],scope:"common",policy:"bounds",task:"",variant:"",includeInterim:false};
test("receipt-bound unique run identities",()=>{
  const v=require("./data-verification-20261029-clear40.json");
  assert.equal(D.runs.length,v.preserved_runs+v.added_runs);
  assert.equal(new Set(D.runs.map(r=>r.id)).size,D.runs.length);
});
test("26 complete metrics for every run",()=>{for(const r of D.runs)assert.equal(Object.keys(r.metrics).length,26);});
test("DepthPro first42 includes three approved subscription supplements",()=>{
  const rows=D.runs.filter(r=>r.group==="sixfig");
  assert.equal(rows.length,42);
  assert.equal(rows.filter(r=>r.source.access==="codex_subscription").length,3);
  assert.equal(D.missing.filter(r=>r.group==="sixfig").length,0);
  const proof=require("./data-verification-20261029-sixfig42.json");
  assert.equal(proof.preserved_runs,533);
  assert.equal(proof.added_metrics_checked,78);
  assert.equal(proof.added_events_checked,25);
  assert.equal(proof.source_metric_mismatches,0);
});
test("42 three-way matched native outcomes",()=>{for(const s of C.summaries(D,state,"score"))assert.equal(s.n,42);});
test("original low/high native totals preserved",()=>{
  const s=C.summaries(D,state,"score");assert.ok(Math.abs(s.find(x=>x.group==="low").total-15.2)<1e-8);assert.ok(Math.abs(s.find(x=>x.group==="high").total-15.35)<1e-8);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="low").total,13);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="high").total,12);
});
test("controls are native controls, not call count",()=>{const s=C.summaries(D,state,"actions");assert.equal(s.find(x=>x.group==="low").total,23327);assert.equal(s.find(x=>x.group==="high").total,24777);});
test("all-run denominators are 42/42/42",()=>{assert.deepEqual(C.summaries(D,{...state,scope:"all"},"score").map(s=>s.n),[42,42,42]);});
test("missing rows are not zero-filled",()=>{
  assert.ok(D.missing.some(x=>x.group==="o23456"&&x.task==="play_stacking_toy"));
  assert.equal(C.summaries(D,{...state,groups:["o23456"],task:"play_stacking_toy"},"score")[0].n,0);
});
test("High final missing sample is subscription-approved without rewriting old evidence",()=>{
  const v=require("./data-verification-20261029-high42.json");
  assert.equal(v.preserved_runs,536);assert.equal(v.added_runs,1);
  assert.equal(v.added_metrics_checked,26);assert.equal(v.added_events_checked,5);
  const row=D.runs.find(r=>r.group==="high"&&r.task==="push_T");
  assert.equal(row.audit,"approved");assert.equal(row.source.access,"codex_subscription");
  assert.equal(D.missing.filter(r=>r.group==="high").length,0);
  assert.equal(D.groups.find(g=>g.id==="high").batch_complete,false);
});
test("unavailable wrong-object metrics not zeros",()=>{assert.equal(C.pair(D,state,"wrong_object").n,0);});
test("strict status policy excludes visual lower bounds",()=>{for(const s of C.summaries(D,{...state,policy:"confirmed"},"empty_retry"))assert.equal(s.n,0);});
test("self-report excluded without altering original source state",()=>{for(const r of D.runs)for(const m of Object.values(r.metrics))if(m.status==="self_report")assert.equal(m.value,null);});
test("interim groups excluded unless explicitly selected",()=>{assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"]}).length,0);assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"],includeInterim:true}).length,42);});
test("completed O groups contain only approved numeric rows",()=>{
  const o1=D.groups.find(g=>g.id==="o1compact"), o456=D.groups.find(g=>g.id==="o456"), standard=D.groups.find(g=>g.id==="o1standard");
  assert.deepEqual([o1.completed,o1.needs_attention,o456.completed,o456.needs_attention,standard.completed,standard.needs_attention],[42,0,42,0,42,0]);
  for(const [id,n,missing] of [["o1compact",42,0],["o456",42,0],["o1standard",42,0]]){
    const rows=D.runs.filter(r=>r.group===id);
    assert.equal(rows.length,n);assert.ok(rows.every(r=>r.audit==="approved"));
    assert.equal(D.missing.filter(r=>r.group===id).length,missing);
    assert.equal(C.summaries(D,{...state,scope:"all",groups:[id]},"score")[0].n,n);
    assert.equal(C.rowsFor(D,{...state,groups:[id],task:"push_T"}).length,1);
  }
  assert.equal(C.rowsFor(D,{...state,groups:["o1compact"],task:"build_tower"}).length,1);
  assert.equal(C.pair(D,state,"score","o1compact","o456").n,42);
});
test("O canonical provenance, event keys and models are explicit",()=>{
  for(const r of D.runs.filter(r=>["o1compact","o456","o1standard"].includes(r.group))){
    for(const key of ["analysis_sha256","assignment_sha256","review_fingerprint"])assert.match(r.source[key],/^[a-f0-9]{64}$/);
    assert.equal(r.config.model,"gpt-6-astra");assert.deepEqual(r.source.models,["gpt-6.1-sol"]);
    assert.equal(r.videos.length,3);
    for(const e of r.events)for(const k of e.metrics)assert.ok(D.metrics.some(m=>m.key===k),k);
  }
  assert.ok(Date.parse(D.o_audit_observed)<=Date.parse(D.built_at));
  assert.equal(D.audit_observed,"2026-10-25 03:37 +08:00");
});
test("O456 and Clear additions preserve prior rows and explicit subscription provenance",()=>{
  const proof=require("./data-verification-20261029-o45642-clear38.json");
  assert.equal(proof.preserved_runs,537);assert.equal(proof.added_runs,2);
  assert.equal(proof.added_metrics_checked,52);assert.equal(proof.source_metric_mismatches,0);
  assert.equal(D.runs.filter(r=>r.group==="o23456").length,40);
  assert.equal(D.missing.filter(r=>r.group==="o23456").length,2);
  assert.ok(proof.checks.every(r=>D.runs.find(x=>x.id===r.run_id).source.access==="codex_subscription"));
  assert.equal(D.groups.find(g=>g.id==="o456").batch_complete,false);
  assert.ok(!D.notes.some(n=>n.includes("40/42、41/42")));
});
test("O1 Standard is a separate selected group with canonical source verification",()=>{
  const g=D.groups.find(g=>g.id==="o1standard"), v=require("./data-verification-20261026-o1-standard.json");
  assert.equal(g.family,"persistent-cap20-o1");assert.equal(g.source,"本批批准分析");
  assert.equal(g.batch_complete,false);assert.equal(g.completed,42);
  assert.equal(v.preserved_runs,416);assert.equal(v.added_runs,41);
  assert.equal(v.added_source_metrics_checked,41*26);assert.equal(v.source_native_mismatches,0);
  assert.equal(v.added_source_events_checked,304);
  assert.equal(v.approved_native_summary.success,10);
  assert.ok(Math.abs(v.approved_native_summary.score_total-13.3)<1e-8);
  assert.equal(C.summaries(D,{...state,groups:["o1standard"],scope:"all"},"success")[0].total,10);
  assert.equal(v.source_native_checks.length,41);
  assert.equal(C.pair(D,state,"score","o1standard","o1compact").n,42);
  assert.equal(C.pair(D,state,"score","o1standard","o456").n,42);
  for(const r of D.runs.filter(r=>r.group==="o1standard"&&r.source.access!=="codex_subscription")){
    assert.equal(r.config.profile,"persistent-cap20-o1");
    assert.match(r.source.native_snapshot_id,/^[a-f0-9]{64}$/);
    const proof=v.source_native_checks.find(p=>p.run_id===r.id);
    assert.equal(r.source.analysis_sha256,proof.analysis_sha256);
    assert.equal(r.source.review_fingerprint,proof.review_fingerprint);
  }
  assert.ok(!F.scope.groups.includes("o1standard"));
});
test("O1 Standard final supplement has exact source proof without placeholder metrics",()=>{
  const v=require("./data-verification-20261029-o1standard42.json");
  assert.equal(v.preserved_runs,539);assert.equal(v.added_runs,1);
  assert.equal(v.added_metrics_checked,26);assert.equal(v.source_metric_mismatches,0);
  const row=D.runs.find(r=>r.group==="o1standard"&&r.task==="push_T");
  assert.equal(row.audit,"approved");assert.equal(row.source.access,"codex_subscription");
  assert.equal(D.missing.filter(r=>r.group==="o1standard").length,0);
  assert.ok(!D.notes.some(n=>n.includes("O1 Standard收录41/42")));
});
test("O1 Compact supplements preserve old rows and keep fixed findings unchanged",()=>{
  const v=require("./data-verification-20261029-o1compact42.json");
  assert.equal(v.preserved_runs,540);assert.equal(v.added_runs,2);
  assert.equal(v.added_metrics_checked,52);assert.equal(v.added_events_checked,16);
  assert.equal(v.source_metric_mismatches,0);
  assert.equal(D.groups.find(g=>g.id==="o1compact").batch_complete,false);
  for(const task of ["build_tower","push_T"]){
    const row=D.runs.find(r=>r.group==="o1compact"&&r.task===task);
    assert.equal(row.audit,"approved");assert.equal(row.source.access,"codex_subscription");
  }
  assert.equal(D.missing.filter(r=>r.group==="o1compact").length,0);
  assert.equal(F.analyze(D,C).tasks.length,40);
});
test("Clear supplements add approved rows without resetting unapproved reviews",()=>{
  const v=require("./data-verification-20261029-clear40.json");
  assert.equal(v.preserved_runs,542);assert.equal(v.added_runs,2);
  assert.equal(v.added_metrics_checked,52);assert.equal(v.added_events_checked,5);
  assert.equal(v.source_metric_mismatches,0);
  for(const task of ["play_Xylophone","play_tic_tac_toe"]){
    const row=D.runs.find(r=>r.group==="o23456"&&r.task===task);
    assert.equal(row.audit,"approved");assert.equal(row.source.access,"codex_subscription");
  }
  assert.deepEqual(D.missing.filter(r=>r.group==="o23456").map(r=>r.task).sort(),
    ["organize_table","play_stacking_toy"]);
});
test("single-task and variant filters respected",()=>{assert.equal(C.pair(D,{...state,task:"align_blocks"},"score").n,1);assert.equal(C.pair(D,{...state,task:"align_blocks",variant:"random"},"score").n,0);});
test("empty summary uses null, n=1 sd is null",()=>{assert.equal(C.stats([]).mean,null);assert.equal(C.stats([4]).sd,null);assert.equal(C.stats([1,3]).median,2);});
test("sign direction does not encode good/bad",()=>{const p=C.pair(D,state,"score");assert.equal(p.more,8);assert.equal(p.less,7);assert.equal(p.equal,27);});
test("CSV is quote-safe and formula-safe",()=>{assert.match(C.csv([['=HYPERLINK("x")','a,b']]),/'=HYPERLINK\(""x""\)/);});
test("no raw private material in public dataset",()=>{
  const data=fs.readFileSync("data.json","utf8");
  for(const s of ["/Users/","/data/user/","/home/","note_quote","rawreasoning","rpc_body","github_pat_","ghp_"])assert.ok(!data.includes(s),s);
});
test("source SHA bindings are complete",()=>{for(const r of D.runs.filter(r=>["low","high"].includes(r.group)))assert.match(r.source.analysis_sha256,/^[a-f0-9]{64}$/);});
test("overview provides six fixed sourced findings",()=>{
  const rows=F.fixed;assert.equal(rows.length,6);
  for(const row of rows){assert.ok(row.fields.length);for(const key of row.fields)assert.ok(D.metrics.some(m=>m.key===key));}
  assert.match(rows[0].title,/O1 Compact/);assert.match(rows[0].text,/32.5%/);
});
test("fixed findings do not change with selected groups or filters",()=>{
  assert.deepEqual(F.fixed.map(row=>row.ids),F.fixed.map(()=>["low","high","o1compact","o456"]));
  assert.equal(F.scope.groups.join(","),"low,high,o1compact,o456");
  assert.equal(F.scope.task,"");assert.equal(F.scope.policy,"bounds");
});
test("all 26 fixed metric denominators and totals match reviewed evidence",()=>{
  const A=F.analyze(D,C);assert.equal(A.tasks.length,40);assert.equal(A.data.runs.length,160);
  assert.ok(A.data.runs.every(r=>!["build_tower","push_T"].includes(r.task)));
  for(const [key,expected] of Object.entries(F.expected))for(const [i,s] of A.metrics[key].entries()){
    assert.equal(s.n,expected[0],key);
    if(expected[i+1]===null)assert.equal(s.total,null);
    else assert.ok(Math.abs(s.total-expected[i+1])<1e-8,key);
  }
  for(const f of F.fixed)for(const [k,v] of Object.entries(f.evidence))assert.deepEqual(v,F.expected[k]);
});
test("fixed task distributions and pair directions support findings",()=>{
  const A=F.analyze(D,C),values=t=>t.rows.map(r=>r.metrics.score.value);
  assert.equal(A.tasks.filter(t=>new Set(values(t)).size===1).length,20);
  assert.equal(A.tasks.filter(t=>values(t).every(x=>x===0)).length,10);
  assert.equal(A.tasks.filter(t=>t.rows.every(r=>r.metrics.success.value===1)).length,7);
  const p=A.pairs.find(p=>p.groups.join(",")==="o1compact,o456");
  assert.deepEqual([p.metrics.empty_retry.n,p.metrics.empty_retry.less,p.metrics.empty_retry.more,p.metrics.empty_retry.equal],[38,12,4,22]);
  for(const p of A.pairs)for(const m of D.metrics)assert.equal(p.metrics[m.key].n,F.expected[m.key][0]);
});
test("empty-grasp finding has no pending badge and unknown candidate tasks stay excluded",()=>{
  assert.equal(F.fixed.find(f=>f.id==="grasp").review,"统计已核对");
  assert.doesNotMatch(F.fixed.find(f=>f.id==="grasp").text,/待复核|尚需/);
  const A=F.analyze(D,C);
  for(const task of ["sort_nesting_dolls_by_size","stack_blocks_by_language"]){
    assert.ok(!A.metrics.empty_retry[0].rows.some(r=>r.task===task));
    assert.ok(F.reviewTasks.some(r=>r.task===task));
  }
  assert.equal(F.reviewTasks.length,8);
});
test("all editorial event examples are bound to confirmed source events",()=>{
  const A=F.analyze(D,C);
  for(const s of F.sections)for(const ref of s.events||[]){
    const r=A.data.runs.find(r=>r.group===ref.group&&r.task===ref.task);
    assert.ok(r);assert.equal(r.events.find(e=>e.id===ref.event)?.status,"confirmed");
    assert.match(r.source.analysis_sha256,/^[a-f0-9]{64}$/);
  }
  assert.equal(new Set(F.sections.flatMap(s=>s.fields)).size,26);
});
test("native scope reconciliation is source-bound and not substituted for audit metrics",()=>{
  const v=require("./data-verification-20261026-o1-standard.json");
  const digest=require("node:crypto").createHash("sha256").update(fs.readFileSync("data.json")).digest("hex");
  const completion=require("./data-verification-20261029-clear40.json");
  assert.equal(completion.data_sha256,digest);
  assert.equal(v.source_metrics_checked,205*26);
  assert.equal(v.source_metric_mismatches,0);
  const r=v.o456_scope_reconciliation;
  assert.deepEqual([r.published_batch.success,r.published_batch.n],[36,81]);
  assert.deepEqual([r.first_round.success,r.first_round.n],[11,42]);
  assert.equal(r.first_round.at_decision_limit.length,4);
  assert.equal(r.omitted_first_round[0].score,0);
});
test("additional O configurations use approved canonical sources and explicit omissions",()=>{
  const proof=require("./data-verification-20261029-completion.json");
  assert.equal(proof.original_public_rows_unchanged,true);
  assert.equal(proof.source_metric_mismatches,0);
  for(const gid of ["o23456","sixfig"]){
    const g=D.groups.find(g=>g.id===gid),rows=D.runs.filter(r=>r.group===gid);
    assert.equal(g.source,"本批批准分析");
    assert.equal(rows.length,g.completed);
    assert.equal(rows.length+D.missing.filter(r=>r.group===gid).length,42);
    for(const row of rows){
      assert.equal(row.audit,"approved");
      assert.ok(["historical","codex_subscription"].includes(row.source.access));
      assert.match(row.source.analysis_sha256,/^[a-f0-9]{64}$/);
      assert.match(row.source.review_fingerprint,/^[a-f0-9]{64}$/);
      assert.equal(row.videos.length,3);
    }
  }
});
test("report and UI keep evidence scope through nested links",()=>{
  const report=require("./four-group-analysis.json"),app=fs.readFileSync("app.js","utf8");
  assert.equal(report.visual_rereview_performed,false);
  assert.equal(report.common_task_n,40);assert.equal(report.metrics.length,26);
  assert.equal(report.pairs.length,6);assert.equal(report.tasks.length,40);
  assert.match(app,/detailData=fixedProof\?A\.data:D/);
  assert.match(app,/taskDetail\(t\.dataset\.task,t\.dataset\.fixedProof==="true"\)/);
});
test("pair columns appear only for exactly two selected groups",()=>{
  assert.deepEqual(C.selectedPair({...state,groups:["low"]}),null);
  assert.deepEqual(C.selectedPair({...state,groups:["low","high"]}),["low","high"]);
  assert.deepEqual(C.selectedPair({...state,groups:["low","high","o1compact"]}),null);
});
test("all page headings are direct labels and source groups are classified",()=>{
  const app=fs.readFileSync("app.js","utf8"),html=fs.readFileSync("index.html","utf8");
  for(const old of ["同一基线","把平均值拆回","每个判断","可复算，也保留未知"])assert.ok(!app.includes(old)&&!html.includes(old));
  assert.match(app,/const defaultGroups = \(\) => D\.groups/);
  assert.doesNotMatch(app,/外部历史参照/);
  assert.match(app,/const defaultGroups = \(\) => D\.groups\.filter\(g=>g\.source==="本批批准分析"\)/);
  assert.match(app,/本次实际分析/);
});
test("overview and group chips show sample counts without temporal labels",()=>{
  const app=fs.readFileSync("app.js","utf8");
  const chip=app.slice(app.indexOf("function chip("),app.indexOf("function pairIds("));
  const overview=app.slice(app.indexOf("function overview("),app.indexOf("function metricCell("));
  assert.match(chip,/分析样本/);
  assert.match(chip,/D\.runs\.filter/);
  assert.doesNotMatch(chip+overview,/本次|历史/);
});
console.log(`\n${tests.length} tests passed.`);
