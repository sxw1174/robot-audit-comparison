const assert = require("node:assert/strict");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const {chromium} = require("playwright");

(async () => {
  const browser = await chromium.launch({headless: true,
    ...(process.env.AUDIT_BROWSER_EXECUTABLE?{executablePath:process.env.AUDIT_BROWSER_EXECUTABLE}:{})});
  const errors = [];
  try {
    for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844}]) {
      const page = await browser.newPage({viewport});
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(process.env.AUDIT_TEST_URL || pathToFileURL(path.join(__dirname, "index.html")).href);
      assert.doesNotMatch(await page.locator("#group-picker").innerText(),/本次|历史/);
      assert.match(await page.locator("#group-picker").innerText(),/分析样本 42/);
      await page.locator("[data-group=persistent]").check();
      assert.doesNotMatch(await page.locator("#view").innerText(),/本次|历史/);
      await page.locator("[data-group=persistent]").uncheck();
      assert.equal(await page.locator("[data-group=o1standard]").isChecked(),true);
      const fixedText=await page.locator("#fixed-findings").innerText();
      assert.equal(await page.locator("#fixed-findings .conclusion").count(),12);
      assert.equal(await page.locator("#fixed-findings > .section-head p").count(),0);
      assert.equal(await page.locator("#fixed-findings > .conclusion-scope, #fixed-findings > .caption").count(),0);
      assert.doesNotMatch(fixedText,/全部14组结果|当前588条记录|成功与得分已逐条对照原生结果/);
      await page.locator("#fixed-findings summary").click();
      await page.locator("#fixed-findings h2").scrollIntoViewIfNeeded();
      await page.screenshot({path:`/tmp/audit-pair-findings-top-${viewport.width}.png`});
      assert.equal(await page.locator("#fixed-findings tbody tr").count(),14);
      await page.screenshot({path:`/tmp/audit-current-overview-${viewport.width}.png`,fullPage:true});
      await page.locator("#fixed-findings summary").click();
      for (const checkbox of await page.locator("[data-group]").all()) {
        if (await checkbox.isChecked()) await checkbox.uncheck();
      }
      await page.locator("[data-group=o1compact]").check();
      await page.locator("[data-group=o456]").check();
      await page.locator("#scope").selectOption("common");
      assert.match(await page.locator("#scope-summary").innerText(), /共同有效 42/);
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      await page.locator("#task").selectOption("align_blocks");
      await page.locator("#policy").selectOption("confirmed");
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      const proofCases=await page.evaluate(()=>window.CurrentFindings.analyze(window.AUDIT_DATA,window.AuditCore).fixed.map(f=>({
        id:f.id,field:f.fields[0],groups:f.scope.groups,
        n:window.AuditCore.summaries(window.AUDIT_DATA,f.scope,f.fields[0])[0].n,
      })));
      for(const proof of proofCases){
        await page.locator(`[data-finding=${proof.id}] [data-current-metric=${proof.field}]`).click();
        await page.locator("#detail").waitFor({state:"visible"});
        const firstTable=page.locator("#detail-body table").first();
        assert.equal(await firstTable.locator("tbody tr").count(),2);
        assert.deepEqual(await firstTable.locator("tbody tr td:nth-child(2)").allTextContents(),
          [`${proof.n} / 42`,`${proof.n} / 42`]);
        const expectedNames=await page.evaluate(ids=>ids.map(id=>window.AUDIT_DATA.groups.find(g=>g.id===id).name),proof.groups);
        assert.deepEqual(await firstTable.locator("tbody tr td:first-child .group-name").allTextContents(),expectedNames);
        await page.keyboard.press("Escape");
      }
      await page.locator("[data-finding=o456-o1-grasp] [data-current-metric=empty_retry]").click();
      await page.locator("#detail").waitFor({state: "visible"});
      assert.match(await page.locator("#detail-body .detail-meta").innerText(), /O1 Compact \/ O456 Clear/);
      await page.locator("#detail-body [data-task=deposit_coin]").click();
      assert.equal(await page.locator("#detail-body [data-run]").count(),2);
      assert.deepEqual(await page.locator("#detail-body [data-run]").evaluateAll(nodes=>nodes.map(n=>n.dataset.run).sort()),
        await page.evaluate(()=>window.AUDIT_DATA.runs.filter(r=>r.task==="deposit_coin"&&["o1compact","o456"].includes(r.group)).map(r=>r.id).sort()));
      await page.locator("#detail-body [data-run]").last().click();
      assert.match(await page.locator("#detail-body").innerText(), /原分析 SHA-256/);
      await page.keyboard.press("Escape");
      await page.locator("[data-finding=compact-clear-outcomes] [data-task=swap_T]").click();
      assert.equal(await page.locator("#detail-body [data-run]").count(),2);
      assert.deepEqual(await page.locator("#detail-body [data-run]").evaluateAll(nodes=>nodes.map(n=>n.dataset.run).sort()),
        await page.evaluate(()=>window.AUDIT_DATA.runs.filter(r=>r.task==="swap_T"&&["o23456","o23456compact"].includes(r.group)).map(r=>r.id).sort()));
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      for(const checkbox of await page.locator("[data-group]").all())if(await checkbox.isChecked())await checkbox.uncheck();
      await page.locator("[data-group=o1standard]").check();
      await page.locator("#task").selectOption("");
      await page.locator("#policy").selectOption("bounds");
      await page.locator("#scope").selectOption("all");
      assert.match(await page.locator("#scope-summary").innerText(),/42/);
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      await page.locator(".sidebar a[href='#tasks']").click();
      await page.waitForFunction(() => document.querySelector("#page-title")?.textContent === "任务对照");
      assert.equal(await page.locator("#view tbody tr").count(),42);
      await page.locator("#view [data-task=align_blocks]").click();
      assert.equal(await page.locator("#detail-body [data-run]").count(),1);
      await page.locator("#detail-body [data-run]").click();
      assert.match(await page.locator("#detail-body").innerText(),/原分析 SHA-256/);
      await page.keyboard.press("Escape");
      for (const route of ["analysis", "metrics", "tasks", "evidence", "relations", "methods", "overview"]) {
        await page.evaluate(route => {location.hash = route;}, route);
        await page.waitForFunction(route => document.querySelector(".sidebar nav a.active")?.hash === "#" + route, route);
        assert.ok((await page.locator("#view").innerText()).length > 100);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${route} overflows at ${viewport.width}`);
        if(route==="analysis"){
          assert.equal(await page.locator(".analysis-report table").first().locator("tbody tr").count(),26);
          assert.match(await page.locator("#view").innerText(),/空夹差异证据/);
        }
      }
      for(const gid of ["o1compact","o23456","sixfig","o23456compact"]){
        for(const checkbox of await page.locator("[data-group]").all())if(await checkbox.isChecked())await checkbox.uncheck();
        await page.locator(`[data-group=${gid}]`).check();
        await page.evaluate(()=>{location.hash="tasks";});
        await page.waitForFunction(()=>document.querySelector("#page-title")?.textContent==="任务对照");
        const n=await page.evaluate(gid=>window.AUDIT_DATA.runs.filter(r=>r.group===gid).length,gid);
        assert.equal(await page.locator("#view tbody tr").count(),n);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      }
      await page.locator("#view [data-task=store_tools_in_toolbox]").click();
      await page.locator("#detail-body [data-run]").click();
      assert.match(await page.locator("#detail-body").innerText(),/当前证据指纹与批准记录不一致/);
      assert.match(await page.locator("#detail-body").innerText(),/旧版本批准指纹/);
      await page.keyboard.press("Escape");
      await page.screenshot({path: `/tmp/audit-o-${viewport.width}.png`, fullPage: true});
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log("PASS desktop/mobile 12 pair findings, exact denominators, nested two-group scopes, seven routes, no errors or overflow");
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
