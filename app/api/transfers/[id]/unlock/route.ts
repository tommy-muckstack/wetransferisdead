import { NextRequest, NextResponse } from "next/server";
import { checkPw, getTransfer, rateLimited, unlockCookieName, unlockToken } from "@/lib/transfers-server";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim(); if (rateLimited(`pw:${id}:${ip}`, 10, 600_000)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  const t = await getTransfer(id); if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 }); const { password } = await req.json().catch(() => ({}));
  if (!t.password || (typeof password === "string" && checkPw(password, t.password))) { const res = NextResponse.json({ ok: true }); res.cookies.set(unlockCookieName(id), unlockToken(id), { httpOnly: true, sameSite: "lax", path: BP || "/", maxAge: 3600 * 6, secure: process.env.NODE_ENV === "production" }); return res; }
  return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
}
