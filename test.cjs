const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
const F = require("./findings.js");
const D = JSON.parse(fs.readFileSync("data.json","utf8"));
const tests=[];
function test(name,fn){fn();tests.push(name);console.log("PASS",name);}
const state={groups:["low","persistent","high"],scope:"common",policy:"bounds",task:"",variant:"",includeInterim:false};
test("416 unique run identities",()=>{assert.equal(D.runs.length,416);assert.equal(new Set(D.runs.map(r=>r.id)).size,416);});
test("26 complete metrics for every run",()=>{for(const r of D.runs)assert.equal(Object.keys(r.metrics).length,26);});
test("41 three-way matched native outcomes",()=>{for(const s of C.summaries(D,state,"score"))assert.equal(s.n,41);});
test("original low/high native totals preserved",()=>{
  const s=C.summaries(D,state,"score");assert.ok(Math.abs(s.find(x=>x.group==="low").total-14.2)<1e-8);assert.ok(Math.abs(s.find(x=>x.group==="high").total-14.35)<1e-8);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="low").total,12);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="high").total,11);
});
test("controls are native controls, not call count",()=>{const s=C.summaries(D,state,"actions");assert.equal(s.find(x=>x.group==="low").total,22981);assert.equal(s.find(x=>x.group==="high").total,24506);});
test("all-run denominators remain 42/42/41",()=>{assert.deepEqual(C.summaries(D,{...state,scope:"all"},"score").map(s=>s.n),[42,42,41]);});
test("missing rows are not zero-filled",()=>{
  assert.ok(D.missing.some(x=>x.group==="high"&&x.task==="push_T"));
  assert.equal(C.summaries(D,{...state,task:"push_T"},"score").find(x=>x.group==="high").n,0);
});
test("unavailable wrong-object metrics not zeros",()=>{assert.equal(C.pair(D,state,"wrong_object").n,0);});
test("strict status policy excludes visual lower bounds",()=>{for(const s of C.summaries(D,{...state,policy:"confirmed"},"empty_retry"))assert.equal(s.n,0);});
test("self-report excluded without altering original source state",()=>{for(const r of D.runs)for(const m of Object.values(r.metrics))if(m.status==="self_report")assert.equal(m.value,null);});
test("interim groups excluded unless explicitly selected",()=>{assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"]}).length,0);assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"],includeInterim:true}).length,42);});
test("O groups retain partial completion without unapproved numeric rows",()=>{
  const o1=D.groups.find(g=>g.id==="o1compact"), o456=D.groups.find(g=>g.id==="o456");
  assert.deepEqual([o1.completed,o1.needs_attention,o456.completed,o456.needs_attention],[40,2,41,1]);
  for(const [id,n,missing] of [["o1compact",40,2],["o456",41,1]]){
    const rows=D.runs.filter(r=>r.group===id);
    assert.equal(rows.length,n);assert.ok(rows.every(r=>r.audit==="approved"));
    assert.equal(D.missing.filter(r=>r.group===id).length,missing);
    assert.equal(C.summaries(D,{...state,scope:"all",groups:[id]},"score")[0].n,n);
    assert.equal(C.rowsFor(D,{...state,groups:[id],task:"push_T"}).length,0);
  }
  assert.equal(C.rowsFor(D,{...state,groups:["o1compact"],task:"build_tower"}).length,0);
  assert.equal(C.pair(D,state,"score","o1compact","o456").n,40);
});
test("O canonical provenance, event keys and models are explicit",()=>{
  for(const r of D.runs.filter(r=>["o1compact","o456"].includes(r.group))){
    for(const key of ["analysis_sha256","assignment_sha256","review_fingerprint"])assert.match(r.source[key],/^[a-f0-9]{64}$/);
    assert.equal(r.config.model,"gpt-6-astra");assert.deepEqual(r.source.models,["gpt-6.1-sol"]);
    assert.equal(r.videos.length,3);
    for(const e of r.events)for(const k of e.metrics)assert.ok(D.metrics.some(m=>m.key===k),k);
  }
  assert.ok(Date.parse(D.o_audit_observed)<=Date.parse(D.built_at));
  assert.equal(D.audit_observed,"2026-10-25 03:37 +08:00");
});
test("single-task and variant filters respected",()=>{assert.equal(C.pair(D,{...state,task:"align_blocks"},"score").n,1);assert.equal(C.pair(D,{...state,task:"align_blocks",variant:"random"},"score").n,0);});
test("empty summary uses null, n=1 sd is null",()=>{assert.equal(C.stats([]).mean,null);assert.equal(C.stats([4]).sd,null);assert.equal(C.stats([1,3]).median,2);});
test("sign direction does not encode good/bad",()=>{const p=C.pair(D,state,"score");assert.equal(p.more,8);assert.equal(p.less,7);assert.equal(p.equal,26);});
test("CSV is quote-safe and formula-safe",()=>{assert.match(C.csv([['=HYPERLINK("x")','a,b']]),/'=HYPERLINK\(""x""\)/);});
test("no raw private material in public dataset",()=>{
  const data=fs.readFileSync("data.json","utf8");
  for(const s of ["/Users/","/data/user/","/home/","note_quote","rawreasoning","rpc_body","github_pat_","ghp_"])assert.ok(!data.includes(s),s);
});
test("source SHA bindings are complete",()=>{for(const r of D.runs.filter(r=>["low","high"].includes(r.group)))assert.match(r.source.analysis_sha256,/^[a-f0-9]{64}$/);});
test("overview provides six fixed sourced findings",()=>{
  const rows=F.fixed;assert.equal(rows.length,6);
  for(const row of rows){assert.ok(row.fields.length);for(const key of row.fields)assert.ok(D.metrics.some(m=>m.key===key));}
  assert.match(rows[0].title,/High成功率未高于Low/);assert.match(rows[0].text,/0.0037/);
});
test("fixed findings do not change with selected groups or filters",()=>{
  assert.deepEqual(F.fixed.map(row=>row.ids),F.fixed.map(()=>["low","high"]));
  assert.equal(F.scope.groups.join(","),"low,high");
});
test("pair columns appear only for exactly two selected groups",()=>{
  assert.deepEqual(C.selectedPair({...state,groups:["low"]}),null);
  assert.deepEqual(C.selectedPair({...state,groups:["low","high"]}),["low","high"]);
  assert.deepEqual(C.selectedPair({...state,groups:["low","high","o1compact"]}),null);
});
test("all page headings are direct labels and all non-interim groups are selectable",()=>{
  const app=fs.readFileSync("app.js","utf8"),html=fs.readFileSync("index.html","utf8");
  for(const old of ["同一基线","把平均值拆回","每个判断","可复算，也保留未知"])assert.ok(!app.includes(old)&&!html.includes(old));
  assert.match(app,/const defaultGroups = \(\) => D\.groups/);
  assert.doesNotMatch(app,/外部历史参照/);
});
console.log(`\n${tests.length} tests passed.`);
