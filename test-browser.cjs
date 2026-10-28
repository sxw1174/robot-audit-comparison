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
      for (const checkbox of await page.locator("[data-group]").all()) {
        if (await checkbox.isChecked()) await checkbox.uncheck();
      }
      await page.locator("[data-group=o1compact]").check();
      await page.locator("[data-group=o456]").check();
      await page.locator("#scope").selectOption("common");
      assert.match(await page.locator(".conclusion-scope").innerText(), /O1 Compact 40\/42.*O456 Clear 41\/42.*共同40/);
      assert.match(await page.locator("#scope-summary").innerText(), /共同有效 40/);
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      await page.locator("#task").selectOption("align_blocks");
      await page.locator("#policy").selectOption("confirmed");
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      await page.locator("[data-finding=grasp] [data-proof-metric=empty_retry]").click();
      await page.locator("#detail").waitFor({state: "visible"});
      assert.equal(await page.locator("#detail-body tbody tr").filter({hasText:"38 / 40"}).count(),4);
      assert.match(await page.locator("#detail-body").innerText(), /固定四组/);
      await page.locator("#detail-body [data-task=deposit_coin]").click();
      assert.equal(await page.locator("#detail-body [data-run]").count(),4);
      await page.locator("#detail-body [data-run]").last().click();
      assert.match(await page.locator("#detail-body").innerText(), /原分析 SHA-256/);
      await page.keyboard.press("Escape");
      for(const checkbox of await page.locator("[data-group]").all())if(await checkbox.isChecked())await checkbox.uncheck();
      await page.locator("[data-group=o1standard]").check();
      await page.locator("#task").selectOption("");
      await page.locator("#policy").selectOption("bounds");
      await page.locator("#scope").selectOption("all");
      assert.match(await page.locator("#scope-summary").innerText(),/41/);
      assert.equal(await page.locator("#fixed-findings").innerText(),fixedText);
      await page.locator(".sidebar a[href='#tasks']").click();
      await page.waitForFunction(() => document.querySelector("#page-title")?.textContent === "任务对照");
      assert.equal(await page.locator("#view tbody tr").count(),41);
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
      for(const gid of ["o23456","sixfig"]){
        for(const checkbox of await page.locator("[data-group]").all())if(await checkbox.isChecked())await checkbox.uncheck();
        await page.locator(`[data-group=${gid}]`).check();
        await page.evaluate(()=>{location.hash="tasks";});
        await page.waitForFunction(()=>document.querySelector("#page-title")?.textContent==="任务对照");
        const n=await page.evaluate(gid=>window.AUDIT_DATA.groups.find(g=>g.id===gid).completed,gid);
        assert.equal(await page.locator("#view tbody tr").count(),n);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      }
      await page.screenshot({path: `/tmp/audit-o-${viewport.width}.png`, fullPage: true});
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log("PASS desktop/mobile O1 Standard, fixed four-group findings, nested evidence scopes, seven routes, no page errors or overflow");
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
