import { describe, it, expect } from "vitest";
import * as T from "@/lib/transfer";
describe("formatting", () => {
  it("formats bytes", () => { expect(T.formatBytes(0)).toBe("0 B"); expect(T.formatBytes(1023)).toBe("1023 B"); expect(T.formatBytes(1536)).toBe("1.5 KB"); expect(T.formatBytes(100 * 1024 * 1024)).toBe("100 MB"); expect(T.formatBytes(5 * 1024 ** 3)).toBe("5 GB"); });
  it("describes time left", () => { const now = new Date("2026-10-14T12:00:00Z"); const e = (ms: number) => ({ expiresAt: new Date(now.getTime() + ms).toISOString() }); expect(T.timeLeft(e(-1), now)).toBe("Expired"); expect(T.timeLeft(e(20 * 60e3), now)).toBe("20 min left"); expect(T.timeLeft(e(3600e3), now)).toBe("1 hour left"); expect(T.timeLeft(e(5 * 3600e3), now)).toBe("5 hours left"); expect(T.timeLeft(e(72 * 3600e3), now)).toBe("3 days left"); });
  it("classifies files", () => { expect(T.fileKind("a.PNG")).toBe("IMG"); expect(T.fileKind("x.pdf")).toBe("PDF"); expect(T.fileKind("noext")).toBe("NOEX"); expect(T.fileKind("a.zip")).toBe("ZIP"); });
});
describe("names", () => {
  it("strips paths and control characters", () => { expect(T.cleanName("../../etc/passwd")).toBe("passwd"); expect(T.cleanName("C:\\Users\\me\\a:b.txt")).toBe("a_b.txt"); expect(T.cleanName("  .hidden ")).toBe("hidden"); expect(T.cleanName("")).toBe("file"); expect(T.cleanName("a\u0000b\nc.txt")).toBe("a_b_c.txt"); });
  it("bounds length and keeps the extension", () => { const n = T.cleanName("x".repeat(300) + ".pdf"); expect(n.length).toBe(T.LIMITS.name); expect(n.endsWith(".pdf")).toBe(true); });
  it("dedupes names within a transfer", () => expect(T.uniqueNames(["a.txt", "A.txt", "b", "b", "a.txt"])).toEqual(["a.txt", "A (2).txt", "b", "b (2)", "a (3).txt"]));
});
describe("validateUpload", () => {
  it("enforces count, emptiness and size", () => { expect(T.validateUpload([])).toMatch(/at least/); expect(T.validateUpload(Array.from({ length: 21 }, () => ({ name: "a", size: 1 })))).toMatch(/up to 20/); expect(T.validateUpload([{ name: "a", size: 0 }])).toMatch(/empty/); expect(T.validateUpload([{ name: "a", size: 60 * 1024 * 1024 }, { name: "b", size: 50 * 1024 * 1024 }])).toMatch(/limit/); expect(T.validateUpload([{ name: "a", size: 100 * 1024 * 1024 }])).toBeNull(); });
  it("generates ids and expiry", () => { expect(T.genId()).toMatch(/^[a-km-z2-9hjk]{12}$/); expect(T.expiryFrom(3, new Date("2026-10-14T00:00:00Z"))).toBe("2026-10-17T00:00:00.000Z"); expect(T.isExpired({ expiresAt: "2020-01-01T00:00:00Z" })).toBe(true); });
  it("toPublic never leaks secrets", () => { const p = T.toPublic({ id: "x", ownerId: "u", message: "", files: [], createdAt: "", expiresAt: "", password: "salt:hash", deleteKey: "k", downloads: 0, perFile: [], lastDownloadAt: null }); expect(JSON.stringify(p)).not.toMatch(/salt|"k"|ownerId|deleteKey/); expect(p.locked).toBe(true); });
});
