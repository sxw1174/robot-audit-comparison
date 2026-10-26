const assert = require("node:assert/strict");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const {chromium} = require("playwright");

(async () => {
  const browser = await chromium.launch({headless: true});
  const errors = [];
  try {
    for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844}]) {
      const page = await browser.newPage({viewport});
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(__dirname, "index.html")).href);
      await page.locator("[data-group=o1compact]").check();
      await page.locator("[data-group=o456]").check();
      await page.locator("[data-group=low]").uncheck();
      await page.locator("[data-group=high]").uncheck();
      assert.match(await page.locator(".conclusion-scope").innerText(), /O1 Compact 40\/42.*O456 Clear 41\/42/);
      assert.match(await page.locator("#scope-summary").innerText(), /共同有效 40/);
      await page.locator("[data-proof-metric=score]").first().click();
      await page.locator("#detail").waitFor({state: "visible"});
      assert.match(await page.locator("#detail-body").innerText(), /40/);
      await page.keyboard.press("Escape");
      for (const route of ["metrics", "tasks", "evidence", "relations", "methods", "overview"]) {
        await page.evaluate(route => {location.hash = route;}, route);
        await page.waitForFunction(route => document.querySelector(".sidebar nav a.active")?.hash === "#" + route, route);
        assert.ok((await page.locator("#view").innerText()).length > 100);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${route} overflows at ${viewport.width}`);
      }
      await page.screenshot({path: `/tmp/audit-o-${viewport.width}.png`, fullPage: true});
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log("PASS desktop/mobile O comparisons, evidence dialog, six routes, no page errors or page overflow");
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
