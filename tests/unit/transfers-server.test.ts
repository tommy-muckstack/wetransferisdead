import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
import { unzipSync } from "fflate";
let S: typeof import("@/lib/transfers-server");
const f = (name: string, text: string) => ({ name, type: "text/plain", bytes: new TextEncoder().encode(text) });
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "wt-")); S = await import("@/lib/transfers-server"); });
describe("transfers", () => {
  it("stores files, returns them intact, and zips them", async () => {
    const r = await S.createTransfer("u1", [f("a.txt", "hello"), f("../b.txt", "world"), f("a.txt", "again")], { message: "  hi  ", days: 7 }); const t = r.transfer!;
    expect(t.message).toBe("hi"); expect(t.files.map(x => x.name)).toEqual(["a.txt", "b.txt", "a (2).txt"]);
    expect((await S.readFile(t, 1))!.toString()).toBe("world"); expect(await S.readFile(t, 9)).toBeNull();
    const z = unzipSync((await S.zipAll(t))!); expect(Object.keys(z)).toEqual(["a.txt", "b.txt", "a (2).txt"]); expect(new TextDecoder().decode(z["a (2).txt"])).toBe("again");
    expect((await S.listTransfers("u1")).map(x => x.id)).toContain(t.id); expect(await S.listTransfers("u2")).toEqual([]);
  });
  it("rejects bad uploads and defaults the expiry", async () => { expect((await S.createTransfer(null, [], {})).error).toBeTruthy(); const t = (await S.createTransfer(null, [f("a", "x")], { days: 99 })).transfer!; expect(Math.round((new Date(t.expiresAt).getTime() - Date.now()) / 864e5)).toBe(3); });
  it("hashes passwords and verifies unlock cookies", async () => {
    const t = (await S.createTransfer(null, [f("a", "x")], { password: "s3cret" })).transfer!; expect(t.password).toBeTruthy(); expect(t.password).not.toContain("s3cret"); expect(S.checkPw("s3cret", t.password!)).toBe(true); expect(S.checkPw("nope", t.password!)).toBe(false);
    expect(S.unlockOk(t.id, S.unlockToken(t.id))).toBe(true); expect(S.unlockOk(t.id, S.unlockToken("other"))).toBe(false); expect(S.unlockOk(t.id, undefined)).toBe(false);
  });
  it("counts downloads atomically and deletes expired transfers with their files", async () => {
    const t = (await S.createTransfer("u1", [f("a", "x"), f("b", "y")], {})).transfer!; await Promise.all(Array.from({ length: 20 }, (_, i) => S.recordDownload(t.id, i % 2)));
    const g = (await S.getTransfer(t.id))!; expect(g.downloads).toBe(20); expect(g.perFile).toEqual([10, 10]);
    expect(await S.readFile(t, 0)).not.toBeNull();
    const p = path.join(process.env["ISDEAD_DATA_DIR"]!, "transfers", t.id + ".json"); const doc = JSON.parse(fs.readFileSync(p, "utf8")); doc.expiresAt = "2020-01-01T00:00:00.000Z"; fs.writeFileSync(p, JSON.stringify(doc));
    expect(await S.getTransfer(t.id)).toBeNull(); expect(await S.readFile(t, 0)).toBeNull();
  });
  it("seeds the demo account once and rate-limits", async () => { const a = await S.listTransfers("demo", true); expect(a).toHaveLength(3); expect(a[0]!.files.length).toBeGreaterThan(0); expect(await S.listTransfers("demo", true)).toHaveLength(3); const now = Date.now(); expect(Array.from({ length: 5 }, () => S.rateLimited("k", 3, 1000, now))).toEqual([false, false, false, true, true]); expect(S.rateLimited("k", 3, 1000, now + 2000)).toBe(false); });
});
