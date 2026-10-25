const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("./core.js");
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
console.log(`\n${tests.length} tests passed.`);
