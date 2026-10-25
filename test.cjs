const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
const F = require("./findings.js");
const D = JSON.parse(fs.readFileSync("data.json","utf8"));
const tests=[];
function test(name,fn){fn();tests.push(name);console.log("PASS",name);}
const state={groups:["low","persistent","high"],scope:"common",policy:"bounds",task:"",variant:"",includeInterim:false};
test("335 unique run identities",()=>{assert.equal(D.runs.length,335);assert.equal(new Set(D.runs.map(r=>r.id)).size,335);});
test("26 complete metrics for every run",()=>{for(const r of D.runs)assert.equal(Object.keys(r.metrics).length,26);});
test("41 three-way matched native outcomes",()=>{for(const s of C.summaries(D,state,"score"))assert.equal(s.n,41);});
test("original low/high native totals preserved",()=>{
  const s=C.summaries(D,state,"score");assert.ok(Math.abs(s.find(x=>x.group==="low").total-14.2)<1e-8);assert.ok(Math.abs(s.find(x=>x.group==="high").total-14.35)<1e-8);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="low").total,12);
  assert.equal(C.summaries(D,state,"success").find(x=>x.group==="high").total,11);
});
test("controls are native controls, not call count",()=>{const s=C.summaries(D,state,"actions");assert.equal(s.find(x=>x.group==="low").total,22981);assert.equal(s.find(x=>x.group==="high").total,24506);});
test("all-run denominators remain 42/42/41",()=>{assert.deepEqual(C.summaries(D,{...state,scope:"all"},"score").map(s=>s.n),[42,42,41]);});
test("missing high push_T not zero-filled",()=>{assert.equal(D.missing.length,1);assert.equal(C.summaries(D,{...state,task:"push_T"},"score")[0].n,0);});
test("unavailable wrong-object metrics not zeros",()=>{assert.equal(C.pair(D,state,"wrong_object").n,0);});
test("strict status policy excludes visual lower bounds",()=>{for(const s of C.summaries(D,{...state,policy:"confirmed"},"empty_retry"))assert.equal(s.n,0);});
test("self-report excluded without altering original source state",()=>{for(const r of D.runs)for(const m of Object.values(r.metrics))if(m.status==="self_report")assert.equal(m.value,null);});
test("interim groups excluded unless explicitly selected",()=>{assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"]}).length,0);assert.equal(C.rowsFor(D,{...state,groups:["o23-compact-medium-r1"],includeInterim:true}).length,42);});
test("single-task and variant filters respected",()=>{assert.equal(C.pair(D,{...state,task:"align_blocks"},"score").n,1);assert.equal(C.pair(D,{...state,task:"align_blocks",variant:"random"},"score").n,0);});
test("empty summary uses null, n=1 sd is null",()=>{assert.equal(C.stats([]).mean,null);assert.equal(C.stats([4]).sd,null);assert.equal(C.stats([1,3]).median,2);});
test("sign direction does not encode good/bad",()=>{const p=C.pair(D,state,"score");assert.equal(p.more,8);assert.equal(p.less,7);assert.equal(p.equal,26);});
test("CSV is quote-safe and formula-safe",()=>{assert.match(C.csv([['=HYPERLINK("x")','a,b']]),/'=HYPERLINK\(""x""\)/);});
test("no raw private material in public dataset",()=>{
  const data=fs.readFileSync("data.json","utf8");
  for(const s of ["/Users/","/data/user/","/home/","note_quote","rawreasoning","rpc_body","github_pat_","ghp_"])assert.ok(!data.includes(s),s);
});
test("source SHA bindings are complete",()=>{for(const r of D.runs.filter(r=>["low","high"].includes(r.group)))assert.match(r.source.analysis_sha256,/^[a-f0-9]{64}$/);});
test("overview provides six sourced findings",()=>{
  const rows=F.build(D,state,["low","high"]);assert.equal(rows.length,6);
  for(const row of rows){assert.ok(row.fields.length);for(const key of row.fields)assert.ok(D.metrics.some(m=>m.key===key));}
  assert.match(rows[0].title,/未提高成功率/);assert.match(rows[0].text,/0.0037/);
});
test("distribution uses the exact paired score cohort",()=>{
  const p=F.summarize(D,state,"score",["low","high"]);
  assert.deepEqual(p.leftBins,{zero:21,partial:8,full:12});
  assert.deepEqual(p.rightBins,{zero:17,partial:13,full:11});
});
test("behavior findings preserve different effective denominators",()=>{
  const empty=F.summarize(D,state,"empty_retry",["low","high"]);
  const placement=F.summarize(D,state,"fine_placement_fail",["low","high"]);
  assert.deepEqual([empty.n,empty.left.total,empty.right.total],[39,32,42]);
  assert.deepEqual([placement.n,placement.left.total,placement.right.total],[36,26,22]);
});
test("empty and one-group selections cannot produce conclusions",()=>{
  assert.deepEqual(F.build(D,{...state,task:"push_T"},["low","high"]),[]);
  assert.deepEqual(F.build(D,state,null),[]);
});
test("findings follow evidence and task filters",()=>{
  assert.deepEqual(F.build(D,{...state,policy:"confirmed"},["low","high"]).map(row=>row.id),["outcomes","distribution","effort"]);
  const rows=F.build(D,{...state,task:"align_blocks"},["low","high"]);
  assert.match(rows[0].text,/1对/);assert.doesNotMatch(rows[0].text,/41对/);
});
test("historical selections do not contaminate the named pair",()=>{
  assert.deepEqual(F.build(D,state,["low","high"]),F.build(D,{...state,groups:["low","high"]},["low","high"]));
  assert.ok(F.build(D,state,["persistent","high"])[0].text.includes("历史 Medium"));
});
test("all page headings are direct labels and defaults exclude Medium",()=>{
  const app=fs.readFileSync("app.js","utf8"),html=fs.readFileSync("index.html","utf8");
  for(const old of ["同一基线","把平均值拆回","每个判断","可复算，也保留未知"])assert.ok(!app.includes(old)&&!html.includes(old));
  assert.match(app,/const state = \{groups:\["low","high"\]/);
});
console.log(`\n${tests.length} tests passed.`);
