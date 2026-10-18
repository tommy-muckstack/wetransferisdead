"use client";
import { useEffect, useState } from "react";
import { track, EVENTS } from "@/lib/analytics";
import { BP } from "@/lib/basepath";
import { fileKind, formatBytes, timeLeft, type PublicTransfer } from "@/lib/transfer";
export function DownloadPage({ t, unlocked }: { t: PublicTransfer; unlocked: boolean }) {
  const [open, setOpen] = useState(unlocked); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const total = t.files.reduce((a, f) => a + f.size, 0);
  useEffect(() => { track(EVENTS.app_transfer_viewed, { files: t.files.length, locked: !unlocked }); }, [t.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dl = (mode: "file" | "zip") => () => track(EVENTS.app_transfer_downloaded, { mode, files: t.files.length });
  const unlock = async (e: React.FormEvent) => { e.preventDefault(); setErr(""); const r = await fetch(`${BP}/api/transfers/${t.id}/unlock`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) }); if (r.ok) { setOpen(true); track(EVENTS.app_transfer_unlocked); } else setErr((await r.json().catch(() => ({}))).error ?? "Couldn't unlock."); };
  return <div className="wt-dl"><div className="wt-card wt-dl__card">
    {!open ? <form onSubmit={unlock}><div className="wt-check" aria-hidden style={{ background: "var(--ids-color-text)" }}>🔒</div><h1 className="ids-h3" style={{ textAlign: "center" }}>This transfer is password protected</h1><label className="ids-label" htmlFor="pw">Password</label><input id="pw" className="ids-input" type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} />
        {err && <p role="alert" className="wt-err">{err}</p>}<button className="ids-btn ids-btn--primary wt-send" style={{ marginTop: 16 }}>Unlock</button></form>
    : <><h1 className="ids-h3" style={{ marginBottom: 4 }}>{t.files.length} file{t.files.length > 1 ? "s" : ""} ready to download</h1><p className="ids-muted" style={{ margin: "0 0 16px" }}>{formatBytes(total)} · {timeLeft(t)}</p>
      {t.message && <p className="wt-msg">{t.message}</p>}
      <ul className="wt-files wt-files--dl" data-testid="files">{t.files.map((f, i) => <li key={i}><span className="wt-ico">{fileKind(f.name)}</span><span className="wt-fn">{f.name}</span><span className="ids-muted">{formatBytes(f.size)}</span><a className="iconbtn" href={`${BP}/api/transfers/${t.id}/download?file=${i}`} onClick={dl("file")}>Download</a></li>)}</ul>
      {t.files.length > 1 && <a className="ids-btn ids-btn--primary wt-send" href={`${BP}/api/transfers/${t.id}/download?all=1`} onClick={dl("zip")} style={{ textAlign: "center" }}>Download all (.zip)</a>}
      {t.files.length === 1 && <a className="ids-btn ids-btn--primary wt-send" href={`${BP}/api/transfers/${t.id}/download?file=0`} onClick={dl("file")} style={{ textAlign: "center" }}>Download</a>}</>}
  </div></div>;
}
