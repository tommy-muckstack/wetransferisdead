import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createTransfer, listTransfers, rateLimited } from "@/lib/transfers-server";
import { LIMITS, toPublic } from "@/lib/transfer";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// POST multipart/form-data: files[], message, days, password. No sign-in needed; a signed-in sender gets the transfer in their history.
export async function POST(req: NextRequest) {
  const len = Number(req.headers.get("content-length") ?? 0); if (len > LIMITS.totalBytes + 2_000_000) return NextResponse.json({ error: "That's more than the transfer limit." }, { status: 413 });
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim(); if (rateLimited("up:" + ip)) return NextResponse.json({ error: "Too many transfers from your network. Try again later." }, { status: 429 });
  let form: FormData; try { form = await req.formData(); } catch { return NextResponse.json({ error: "Couldn't read the upload." }, { status: 400 }); }
  const files: { name: string; type: string; bytes: Uint8Array }[] = []; for (const f of form.getAll("files")) if (typeof f !== "string") files.push({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) });
  const u = await currentUser();
  const r = await createTransfer(u?.id ?? null, files, { message: String(form.get("message") ?? ""), days: Number(form.get("days") ?? 3), password: String(form.get("password") ?? "") });
  if (!r.transfer) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ id: r.transfer.id, deleteKey: r.transfer.deleteKey, transfer: toPublic(r.transfer) }, { status: 201 });
}
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ transfers: (await listTransfers(u.id, u.demo)).map(toPublic) }); }
