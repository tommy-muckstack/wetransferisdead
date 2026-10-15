// Pure helpers for file transfers: limits, validation, naming, expiry.
export const LIMITS = { files: 20, totalBytes: (Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 100) * 1024 * 1024, message: 500, password: 100, name: 120 };
export const EXPIRY_DAYS = [1, 3, 7] as const; export type ExpiryDays = (typeof EXPIRY_DAYS)[number];
export type FileMeta = { name: string; size: number; type: string; stored: string };
export type Transfer = { id: string; ownerId: string | null; message: string; files: FileMeta[]; createdAt: string; expiresAt: string; password: string | null; deleteKey: string; downloads: number; perFile: number[]; lastDownloadAt: string | null };
export type PublicTransfer = Omit<Transfer, "password" | "deleteKey" | "ownerId"> & { locked: boolean };

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`; const u = ["KB", "MB", "GB", "TB"]; let v = n / 1024, i = 0; while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v >= 100 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}
/** Safe, display-friendly filename: no paths, no control chars, bounded length. */
export function cleanName(raw: string): string {
  const base = raw.replace(/\\/g, "/").split("/").pop() ?? ""; let s = base.replace(/[\u0000-\u001f\u007f"<>:|?*]/g, "_").trim().replace(/^\.+/, "");
  if (s.length > LIMITS.name) { const dot = s.lastIndexOf("."); const ext = dot > 0 && s.length - dot <= 12 ? s.slice(dot) : ""; s = s.slice(0, LIMITS.name - ext.length) + ext; }
  return s || "file";
}
/** Make names unique within one transfer: a.txt, a (2).txt, a (3).txt */
export function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>(); return names.map(n => { const k = n.toLowerCase(); const c = (seen.get(k) ?? 0) + 1; seen.set(k, c); if (c === 1) return n; const dot = n.lastIndexOf("."); return dot > 0 ? `${n.slice(0, dot)} (${c})${n.slice(dot)}` : `${n} (${c})`; });
}
export function validateUpload(files: { name: string; size: number }[]): string | null {
  if (files.length === 0) return "Add at least one file."; if (files.length > LIMITS.files) return `You can send up to ${LIMITS.files} files at once.`;
  if (files.some(f => f.size <= 0)) return "One of those files is empty."; const total = files.reduce((a, f) => a + f.size, 0);
  if (total > LIMITS.totalBytes) return `That's ${formatBytes(total)}. The limit is ${formatBytes(LIMITS.totalBytes)} per transfer.`; return null;
}
export const isExpired = (t: Pick<Transfer, "expiresAt">, now = new Date()) => new Date(t.expiresAt).getTime() <= now.getTime();
export const expiryFrom = (days: number, now = new Date()) => new Date(now.getTime() + days * 864e5).toISOString();
export function timeLeft(t: Pick<Transfer, "expiresAt">, now = new Date()): string {
  const ms = new Date(t.expiresAt).getTime() - now.getTime(); if (ms <= 0) return "Expired"; const h = Math.floor(ms / 36e5); if (h >= 48) return `${Math.floor(h / 24)} days left`; if (h >= 1) return `${h} hour${h === 1 ? "" : "s"} left`; return `${Math.max(1, Math.floor(ms / 6e4))} min left`;
}
const ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function genId(len = 12, rnd: (n: number) => number = n => Math.floor(Math.random() * n)): string { let s = ""; for (let i = 0; i < len; i++) s += ID_ALPHABET[rnd(ID_ALPHABET.length)]; return s; }
export const fileKind = (name: string): string => { const e = name.split(".").pop()?.toLowerCase() ?? ""; if (/^(png|jpe?g|gif|webp|svg|heic|avif)$/.test(e)) return "IMG"; if (/^(mp4|mov|webm|mkv|avi)$/.test(e)) return "VID"; if (/^(mp3|wav|m4a|flac|ogg)$/.test(e)) return "AUD"; if (/^(zip|rar|7z|tar|gz)$/.test(e)) return "ZIP"; if (e === "pdf") return "PDF"; if (/^(csv|xls|xlsx)$/.test(e)) return "XLS"; if (/^(doc|docx|txt|md|rtf)$/.test(e)) return "DOC"; return (e || "FILE").slice(0, 4).toUpperCase(); };
export const toPublic = (t: Transfer): PublicTransfer => { const { password, deleteKey: _k, ownerId: _o, ...rest } = t; return { ...rest, locked: !!password }; };
