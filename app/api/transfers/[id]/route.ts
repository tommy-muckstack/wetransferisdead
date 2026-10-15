import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { currentUser } from "@/lib/session";
import { getTransfer, removeTransfer } from "@/lib/transfers-server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// DELETE: the signed-in owner, or anyone holding the delete key returned when the transfer was made.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const t = await getTransfer(id); if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const u = await currentUser(); const key = req.nextUrl.searchParams.get("key") ?? "";
  const keyOk = key.length === t.deleteKey.length && crypto.timingSafeEqual(Buffer.from(key), Buffer.from(t.deleteKey));
  if (!(u && t.ownerId === u.id) && !keyOk) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  await removeTransfer(id); return new NextResponse(null, { status: 204 });
}
