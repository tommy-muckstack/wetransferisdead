import { cookies } from "next/headers";
import Link from "next/link";
import { getTransfer, unlockCookieName, unlockOk } from "@/lib/transfers-server";
import { toPublic } from "@/lib/transfer";
import { SiteNav } from "@/components/SiteNav";
import { DownloadPage } from "@/components/DownloadPage";
export const dynamic = "force-dynamic";
export const metadata = { title: "Download files | WeTransferIsDead", robots: { index: false } };
export default async function Transfer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const t = await getTransfer(id); const jar = await cookies();
  return <div className="wt-dlroot"><SiteNav />{!t ? <div className="wt-dl"><div className="wt-card wt-dl__card" style={{ textAlign: "center" }}><h1 className="ids-h3">This transfer is gone</h1><p className="ids-muted">It expired or the sender deleted it.</p><Link className="ids-btn ids-btn--primary" href="/">Send your own files</Link></div></div>
    : <DownloadPage t={toPublic(t)} unlocked={!t.password || unlockOk(id, jar.get(unlockCookieName(id))?.value)} />}</div>;
}
