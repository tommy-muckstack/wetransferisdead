// Server-side transfers: metadata and file bytes via lib/store.ts (Firestore in production, files in dev).
// Vercel request bodies cap at 4.5 MB, so production sets NEXT_PUBLIC_MAX_UPLOAD_MB=4. Larger transfers need object storage with signed uploads (README "Gaps").
import crypto from "node:crypto";
import { zipSync } from "fflate";
import { getDoc, putDoc, delDoc, listDocs, putBlob, getBlob, delBlob } from "@/lib/store";
import { LIMITS, cleanName, uniqueNames, validateUpload, genId, expiryFrom, isExpired, EXPIRY_DAYS, type Transfer } from "@/lib/transfer";
const COL = "transfers";
const blobId = (id: string, stored: string) => id.replace(/[^a-z0-9]/g, "") + "-" + stored;
const chain = new Map<string, Promise<unknown>>();
function locked<T>(k: string, fn: () => Promise<T>): Promise<T> { const prev = chain.get(k) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(k, next.catch(() => {})); return next; }

const hashPw = (pw: string) => { const salt = crypto.randomBytes(16); return salt.toString("hex") + ":" + crypto.scryptSync(pw, salt, 32).toString("hex"); };
export const checkPw = (pw: string, stored: string) => { const [s, h] = stored.split(":"); if (!s || !h) return false; const a = crypto.scryptSync(pw, Buffer.from(s, "hex"), 32), b = Buffer.from(h, "hex"); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const secret = () => process.env["AUTH_SECRET"] ?? "dev-only-secret-change-me-in-production";
export const unlockToken = (id: string) => crypto.createHmac("sha256", secret()).update("unlock:" + id).digest("base64url");
export const unlockCookieName = (id: string) => "wtu_" + id;
export const unlockOk = (id: string, cookie: string | undefined) => { if (!cookie) return false; const w = unlockToken(id); return w.length === cookie.length && crypto.timingSafeEqual(Buffer.from(w), Buffer.from(cookie)); };

export async function createTransfer(ownerId: string | null, files: { name: string; type: string; bytes: Uint8Array }[], opts: { message?: string; days?: number; password?: string }): Promise<{ transfer?: Transfer; error?: string }> {
  const bad = validateUpload(files.map(f => ({ name: f.name, size: f.bytes.length }))); if (bad) return { error: bad };
  const days = EXPIRY_DAYS.includes(opts.days as 1) ? opts.days! : 3; const pw = (opts.password ?? "").slice(0, LIMITS.password);
  let id = genId(); while (await getDoc(COL, id)) id = genId();
  const names = uniqueNames(files.map(f => cleanName(f.name)));
  const metas = []; for (let i = 0; i < files.length; i++) { await putBlob("files", blobId(id, String(i)), files[i]!.bytes); metas.push({ name: names[i]!, size: files[i]!.bytes.length, type: (files[i]!.type || "application/octet-stream").slice(0, 100), stored: String(i) }); }
  const t: Transfer = { id, ownerId, message: (opts.message ?? "").trim().slice(0, LIMITS.message), files: metas, createdAt: new Date().toISOString(), expiresAt: expiryFrom(days), password: pw ? hashPw(pw) : null, deleteKey: crypto.randomBytes(12).toString("base64url"), downloads: 0, perFile: metas.map(() => 0), lastDownloadAt: null };
  await putDoc(COL, id, t); return { transfer: t };
}
export async function removeTransfer(id: string) { const t = await getDoc<Transfer>(COL, id); await delDoc(COL, id); for (const m of t?.files ?? []) await delBlob("files", blobId(id, m.stored)); }
/** Returns the transfer, or null when missing/expired (expired ones are deleted on the spot). */
export async function getTransfer(id: string): Promise<Transfer | null> { const t = await getDoc<Transfer>(COL, id); if (!t) return null; if (isExpired(t)) { await removeTransfer(id); return null; } return t; }
export async function listTransfers(ownerId: string, demo = false): Promise<Transfer[]> {
  const all = await listDocs<Transfer>(COL); const mine: Transfer[] = [];
  for (const t of all) { if (isExpired(t)) { await removeTransfer(t.id); continue; } if (t.ownerId === ownerId) mine.push(t); }
  if (mine.length === 0 && demo && !(await getDoc("seeded", ownerId))) { await putDoc("seeded", ownerId, { at: Date.now() }); for (const s of demoSeeds()) { const r = await createTransfer(ownerId, s.files, { message: s.message, days: s.days }); if (r.transfer) { r.transfer.downloads = s.downloads; r.transfer.perFile = r.transfer.files.map((_, i) => (i === 0 ? s.downloads : Math.max(0, s.downloads - 1))); await putDoc(COL, r.transfer.id, r.transfer); mine.push(r.transfer); } } }
  return mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const recordDownload = (id: string, index: number | null) => locked(id, async () => { const t = await getDoc<Transfer>(COL, id); if (!t) return; t.downloads++; t.lastDownloadAt = new Date().toISOString(); if (index !== null) t.perFile[index] = (t.perFile[index] ?? 0) + 1; else t.perFile = t.perFile.map(n => n + 1); await putDoc(COL, id, t); });
export async function readFile(t: Transfer, index: number): Promise<Buffer | null> { const m = t.files[index]; if (!m) return null; return await getBlob("files", blobId(t.id, m.stored)); }
export async function zipAll(t: Transfer): Promise<Uint8Array | null> { const entries: Record<string, Uint8Array> = {}; for (let i = 0; i < t.files.length; i++) { const b = await readFile(t, i); if (!b) return null; entries[t.files[i]!.name] = new Uint8Array(b); } return zipSync(entries, { level: 0 }); }

// crude per-process rate limit for anonymous senders
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 30, windowMs = 3600_000, now = Date.now()): boolean { const a = (hits.get(key) ?? []).filter(x => now - x < windowMs); if (a.length >= max) { hits.set(key, a); return true; } a.push(now); hits.set(key, a); return false; }

function demoSeeds() {
  const te = (s: string) => new TextEncoder().encode(s);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#409FFF"/><circle cx="160" cy="100" r="54" fill="#fff"/></svg>`;
  return [
    { message: "Here are the final brand files for the spring campaign. Shout if anything looks off!", days: 7, downloads: 4, files: [{ name: "campaign-hero.svg", type: "image/svg+xml", bytes: te(svg) }, { name: "brand-notes.txt", type: "text/plain", bytes: te("Brand notes\n\n- Primary blue: #409FFF\n- Tone: warm, direct, short sentences\n") }, { name: "launch-budget.csv", type: "text/csv", bytes: te("item,cost\nPhotography,1800\nPrint,950\nAds,2400\n") }] },
    { message: "Signed contract for your records.", days: 3, downloads: 1, files: [{ name: "contract-signed.txt", type: "text/plain", bytes: te("Signed on 2026-10-12.\n") }] },
    { message: "", days: 1, downloads: 0, files: [{ name: "meeting-notes.txt", type: "text/plain", bytes: te("Meeting notes\n- Ship Friday\n- Review pricing\n") }] },
  ];
}
