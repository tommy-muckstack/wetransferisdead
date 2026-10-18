"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/analytics";
import { UploadCard } from "@/components/UploadCard";
import { formatBytes, timeLeft, type PublicTransfer } from "@/lib/transfer";
export function Transfers({ initial }: { initial: PublicTransfer[] }) {
  const r = useRouter(); const [list, setList] = useState(initial); const [copied, setCopied] = useState<string | null>(null);
  const del = async (id: string) => { if (!confirm("Delete this transfer? The link will stop working.")) return; if ((await fetch(`${BP}/api/transfers/${id}`, { method: "DELETE" })).ok) { setList(l => l.filter(t => t.id !== id)); track(EVENTS.app_transfer_deleted, { via: "history" }); } };
  return <main className="wt-app"><div className="wt-app__new"><h1 className="ids-h2" style={{ marginBottom: 16 }}>Send files</h1><UploadCard onDone={() => { r.refresh(); fetch(`${BP}/api/transfers`).then(x => x.json()).then(j => setList(j.transfers ?? [])); }} /></div>
    <section className="wt-app__list"><h2 className="ids-h3" style={{ marginBottom: 14 }}>Your transfers <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{list.length}</span></h2>
      <ul className="wt-hist" data-testid="history">{list.map(t => <li key={t.id} className="ids-card wt-h"><div className="wt-h__main"><b>{t.files.length === 1 ? t.files[0]!.name : `${t.files[0]!.name} + ${t.files.length - 1} more`}</b>
        <span className="ids-muted">{formatBytes(t.files.reduce((a, f) => a + f.size, 0))} · {t.downloads} download{t.downloads === 1 ? "" : "s"} · {timeLeft(t)}{t.locked ? " · 🔒" : ""}</span>{t.message && <span className="wt-h__msg">“{t.message}”</span>}</div>
        <div className="tb"><button className="iconbtn" onClick={async () => { try { await navigator.clipboard.writeText(`${location.origin}${BP}/t/${t.id}`); } catch { /* ignore */ } setCopied(t.id); track(EVENTS.app_shared, { method: "copy_link", via: "history" }); setTimeout(() => setCopied(null), 1400); }}>{copied === t.id ? "Copied!" : "Copy link"}</button><a className="iconbtn" href={`${BP}/t/${t.id}`} target="_blank" rel="noreferrer">Open</a><button className="iconbtn" aria-label={`Delete transfer ${t.id}`} onClick={() => del(t.id)}>Delete</button></div></li>)}
        {list.length === 0 && <li className="ids-card wt-h" style={{ justifyContent: "center", color: "var(--ids-color-text-muted)" }}>No transfers yet. Send your first one above.</li>}</ul></section></main>;
}
