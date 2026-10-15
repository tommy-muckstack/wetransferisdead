// Drives the real app (production build) to capture product shots AND smoke-test the core flow, including real uploads and downloads.
import fs from "node:fs";
import assert from "node:assert/strict";
import { unzipSync } from "fflate";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("wetransferisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, opts = {}) => { await page.screenshot({ path: `${dir}/${name}.png`, ...opts }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
const files = [{ name: "campaign-hero.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="#409FFF"/></svg>') }, { name: "brand-notes.txt", mimeType: "text/plain", buffer: Buffer.from("Primary blue: #409FFF\n") }, { name: "budget.csv", mimeType: "text/csv", buffer: Buffer.from("item,cost\nPrint,950\n") }];
await withApp("wetransferisdead", async ({ base, browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const page = await ctx.newPage();
  // anonymous send from the homepage
  await page.goto(base); await page.getByTestId("upload-card").waitFor(); await page.setInputFiles('input[type="file"]', files); await page.getByLabel("Message").fill("Final files for the spring campaign. Shout if anything looks off!");
  await page.waitForTimeout(300); await page.screenshot({ path: `${dir}/home-top.png` }); await page.locator('[data-testid="upload-card"]').screenshot({ path: `${dir}/card.png` }); fs.copyFileSync(`${dir}/card.png`, `${pub}card.png`);
  await page.getByRole("button", { name: "Get a link" }).click(); await page.getByTestId("sent").waitFor(); const link = await page.getByTestId("link").inputValue(); assert.match(link, /\/wetransferisdead\/t\/[a-z0-9]{12}$/); await page.waitForTimeout(300); await page.locator('[data-testid="sent"]').screenshot({ path: `${dir}/sent.png` }); fs.copyFileSync(`${dir}/sent.png`, `${pub}sent.png`);
  // recipient (separate browser context, no cookies) downloads one file and the zip
  const rc = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const rp = await rc.newPage(); await rp.goto(link); await rp.getByTestId("files").waitFor(); assert.equal(await rp.locator('[data-testid="files"] li').count(), 3); await rp.waitForTimeout(300); await save(rp, "download");
  const [d1] = await Promise.all([rp.waitForEvent("download"), rp.getByRole("link", { name: "Download" }).nth(1).click()]); assert.equal(d1.suggestedFilename(), "brand-notes.txt"); assert.equal(fs.readFileSync(await d1.path(), "utf8"), "Primary blue: #409FFF\n");
  const [d2] = await Promise.all([rp.waitForEvent("download"), rp.getByRole("link", { name: "Download all (.zip)" }).click()]); const z = unzipSync(new Uint8Array(fs.readFileSync(await d2.path()))); assert.deepEqual(Object.keys(z).sort(), ["brand-notes.txt", "budget.csv", "campaign-hero.svg"]);
  // delete with the key from the sender's card (anonymous sender)
  page.once("dialog", d => d.accept()); await page.getByRole("button", { name: "Delete transfer" }).click(); await page.getByText("Transfer deleted").waitFor(); await rp.reload(); await rp.getByText("This transfer is gone").waitFor();
  // password-protected transfer
  await page.getByRole("button", { name: "Send more files" }).click(); await page.getByTestId("upload-card").waitFor(); await page.setInputFiles('input[type="file"]', files.slice(1)); await page.getByRole("button", { name: "Add a password" }).click(); await page.getByLabel("Transfer password").fill("Open-sesame-1"); await page.getByRole("button", { name: "Get a link" }).click(); await page.getByTestId("sent").waitFor(); const plink = await page.getByTestId("link").inputValue();
  const pc = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const pp = await pc.newPage(); await pp.goto(plink); await pp.getByText("This transfer is password protected").waitFor(); await pp.waitForTimeout(300); await save(pp, "password");
  assert.equal((await pc.request.get(plink.replace("/t/", "/api/transfers/") + "/download?file=0")).status(), 401, "no download without the password");
  await pp.getByLabel("Password").fill("wrong"); await pp.getByRole("button", { name: "Unlock" }).click(); await pp.getByText("That password isn't right.").waitFor(); await pp.getByLabel("Password").fill("Open-sesame-1"); await pp.getByRole("button", { name: "Unlock" }).click(); await pp.getByTestId("files").waitFor();
  assert.equal((await pc.request.get(plink.replace("/t/", "/api/transfers/") + "/download?file=0")).status(), 200); await pp.reload(); await pp.getByTestId("files").waitFor();
  assert.equal((await ctx.request.post(`${base}/api/transfers`, { multipart: { files: { name: "e.txt", mimeType: "text/plain", buffer: Buffer.alloc(0) } } })).status(), 400);
  assert.equal((await ctx.request.post(`${base}/api/transfers`, { multipart: {} })).status(), 400); await pc.close(); await rc.close(); await ctx.close();
  // signed-in history (demo account)
  const { ctx: dc, page: dp } = await demoPage(browser, base, { w: 1440, h: 900 }); await dp.waitForSelector('[data-testid="history"] li'); assert.equal(await dp.locator('[data-testid="history"] li').count(), 3);
  await dp.setInputFiles('input[type="file"]', files.slice(0, 1)); await dp.getByRole("button", { name: "Get a link" }).click(); await dp.getByTestId("sent").waitFor(); await dp.waitForFunction(() => document.querySelectorAll('[data-testid="history"] li').length === 4); await dp.getByRole("button", { name: "Send more files" }).click(); await dp.waitForTimeout(300); await save(dp, "history");
  page.once; dp.once("dialog", d => d.accept()); await dp.getByRole("button", { name: /Delete transfer/ }).first().click(); await dp.waitForFunction(() => document.querySelectorAll('[data-testid="history"] li').length === 3); await dc.close();
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage(); await mp.goto(base); await mp.setInputFiles('input[type="file"]', files); await mp.waitForTimeout(400); await mp.screenshot({ path: `${dir}/mobile-home.png` });
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile homepage"); await mp.goto(plink); await mp.waitForTimeout(300); assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile download page"); await mp.screenshot({ path: `${dir}/mobile-download.png` });
  await mp.goto(base + "/login"); await mp.getByRole("button", { name: "Use the demo account" }).click(); await mp.waitForURL(/\/app/); await mp.waitForSelector('[data-testid="history"] li'); assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile app"); await mp.screenshot({ path: `${dir}/mobile-app.png` }); await m.close();
  const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p3 = await c3.newPage(); await p3.goto(base); await p3.waitForTimeout(400); await p3.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await p3.goto(base + "/#pricing"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/home-pricing.png` }); await p3.goto(base + "/login"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/login.png` });
  const c5 = await browser.newContext(); const p5 = await c5.newPage(); await p5.goto(base + "/app"); assert.match(p5.url(), /\/login/);
  console.log("wetransferisdead smoke OK");
});
