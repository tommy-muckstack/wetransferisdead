import { NextRequest, NextResponse } from "next/server";
import { getTransfer, readFile, recordDownload, unlockCookieName, unlockOk, zipAll } from "@/lib/transfers-server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const disp = (name: string) => `attachment; filename="${name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'")}"; filename*=UTF-8''${encodeURIComponent(name)}`;
// GET ?file=<n> downloads one file; ?all=1 downloads every file as a zip. Password-protected transfers need the unlock cookie.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const t = await getTransfer(id); if (!t) return new NextResponse("This transfer has expired or was deleted.", { status: 410 });
  if (t.password && !unlockOk(id, req.cookies.get(unlockCookieName(id))?.value)) return new NextResponse("Password required.", { status: 401 });
  const sp = req.nextUrl.searchParams; const headers = { "cache-control": "private, no-store", "x-content-type-options": "nosniff" };
  if (sp.get("all")) { const z = await zipAll(t); if (!z) return new NextResponse("File missing.", { status: 404 }); await recordDownload(id, null); return new NextResponse(new Uint8Array(z), { headers: { ...headers, "content-type": "application/zip", "content-disposition": disp(`transfer-${id}.zip`) } }); }
  const i = Number(sp.get("file")); if (!Number.isInteger(i) || i < 0 || i >= t.files.length) return new NextResponse("No such file.", { status: 404 });
  const b = await readFile(t, i); if (!b) return new NextResponse("File missing.", { status: 404 }); await recordDownload(id, i);
  return new NextResponse(new Uint8Array(b), { headers: { ...headers, "content-type": "application/octet-stream", "content-disposition": disp(t.files[i]!.name), "content-length": String(b.length) } });
}
