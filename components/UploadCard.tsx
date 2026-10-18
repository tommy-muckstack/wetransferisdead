"use client";
import { useRef, useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/analytics";
import { EXPIRY_DAYS, LIMITS, fileKind, formatBytes, validateUpload, type PublicTransfer } from "@/lib/transfer";
type Done = { id: string; deleteKey: string; transfer: PublicTransfer };
/** The whole product in one card: add files, optional message/password/expiry, send, get a link. Works signed out. */
export function UploadCard({ onDone }: { onDone?: (d: Done) => void }) {
  const [files, setFiles] = useState<File[]>([]); const [msg, setMsg] = useState(""); const [days, setDays] = useState<number>(3); const [pw, setPw] = useState(""); const [usePw, setUsePw] = useState(false);
  const [drag, setDrag] = useState(false); const [err, setErr] = useState(""); const [pct, setPct] = useState<number | null>(null); const [done, setDone] = useState<Done | null>(null); const [copied, setCopied] = useState(false); const [deleted, setDeleted] = useState(false);
  const input = useRef<HTMLInputElement>(null); const total = files.reduce((a, f) => a + f.size, 0);
  const add = (list: FileList | File[] | null) => { if (!list) return; const picked = Array.from(list); setErr(""); setFiles(cur => { const next = [...cur]; for (const f of picked) if (!next.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) next.push(f); return next; }); };
  const link = done ? `${location.origin}${BP}/t/${done.id}` : "";
  const send = () => {
    const bad = validateUpload(files.map(f => ({ name: f.name, size: f.size }))); if (bad) return setErr(bad); setErr(""); setPct(0);
    const fd = new FormData(); files.forEach(f => fd.append("files", f)); fd.set("message", msg); fd.set("days", String(days)); if (usePw && pw) fd.set("password", pw);
    const x = new XMLHttpRequest(); x.open("POST", `${BP}/api/transfers`); x.upload.onprogress = e => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    x.onload = () => { setPct(null); let j: any = {}; try { j = JSON.parse(x.responseText); } catch { /* ignore */ } if (x.status === 201) { setDone(j); onDone?.(j); track(EVENTS.app_transfer_created, { files: files.length, total_mb: Math.round(total / 1e6), expiry_days: days, password: !!(usePw && pw), has_message: !!msg.trim() }); } else setErr(j.error ?? "Something went wrong. Try again."); };
    x.onerror = () => { setPct(null); setErr("The upload failed. Check your connection and try again."); }; x.send(fd);
  };
  const reset = () => { setFiles([]); setMsg(""); setPw(""); setUsePw(false); setDone(null); setDeleted(false); setErr(""); };
  const del = async () => { if (!done || !confirm("Delete this transfer? The link will stop working.")) return; const r = await fetch(`${BP}/api/transfers/${done.id}?key=${encodeURIComponent(done.deleteKey)}`, { method: "DELETE" }); if (r.ok) { setDeleted(true); track(EVENTS.app_transfer_deleted, { via: "sent_card" }); } };
  const mail = done ? `mailto:?subject=${encodeURIComponent("Files for you")}&body=${encodeURIComponent((msg ? msg + "\n\n" : "") + `Download: ${link}\nThis link expires in ${days} day${days > 1 ? "s" : ""}.`)}` : "#";

  if (done) return <div className="wt-card" data-testid="sent"><div className="wt-sent"><div className="wt-check" aria-hidden>✓</div><h2>{deleted ? "Transfer deleted" : "Your files are ready"}</h2>
    {!deleted ? <><p className="ids-muted">{done.transfer.files.length} file{done.transfer.files.length > 1 ? "s" : ""} · {formatBytes(done.transfer.files.reduce((a, f) => a + f.size, 0))} · expires in {days} day{days > 1 ? "s" : ""}{done.transfer.locked ? " · password protected" : ""}</p>
      <div className="wt-link"><input readOnly aria-label="Download link" value={link} onFocus={e => e.currentTarget.select()} data-testid="link" /><button className="ids-btn ids-btn--primary" onClick={async () => { try { await navigator.clipboard.writeText(link); } catch { /* ignore */ } setCopied(true); track(EVENTS.app_shared, { method: "copy_link", via: "sent_card" }); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied!" : "Copy link"}</button></div>
      <div className="tb" style={{ justifyContent: "center", marginTop: 12 }}><a className="iconbtn" href={mail} onClick={() => track(EVENTS.app_shared, { method: "email", via: "sent_card" })}>Email it</a><a className="iconbtn" href={`${BP}/t/${done.id}`} target="_blank" rel="noreferrer">Open page</a><button className="iconbtn" onClick={del}>Delete transfer</button></div></>
      : <p className="ids-muted">The link no longer works.</p>}
    <button className="ids-btn ids-btn--outline" style={{ marginTop: 20 }} onClick={reset}>Send more files</button></div></div>;

  return <div className="wt-card" data-testid="upload-card">
    <div className={"wt-drop" + (drag ? " on" : "") + (files.length ? " has" : "")} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}>
      {files.length === 0 ? <button type="button" className="wt-add" onClick={() => input.current?.click()}><span className="wt-plus" aria-hidden>+</span><b>Add your files</b><span className="ids-muted">or drop them here · up to {formatBytes(LIMITS.totalBytes)}</span></button>
        : <><ul className="wt-files">{files.map((f, i) => <li key={f.name + f.size + i}><span className="wt-ico">{fileKind(f.name)}</span><span className="wt-fn">{f.name}</span><span className="ids-muted">{formatBytes(f.size)}</span><button aria-label={`Remove ${f.name}`} onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}>×</button></li>)}</ul>
          <div className="wt-sum"><button type="button" className="iconbtn" onClick={() => input.current?.click()}>+ Add more</button><span className="ids-muted">{files.length} file{files.length > 1 ? "s" : ""} · {formatBytes(total)} of {formatBytes(LIMITS.totalBytes)}</span></div></>}
      <input ref={input} type="file" multiple hidden aria-label="Choose files" onChange={e => { add(e.target.files); e.target.value = ""; }} /></div>
    <label className="ids-label" htmlFor="wt-msg">Message <span className="ids-muted">(optional)</span></label><textarea id="wt-msg" className="ids-input wt-ta" value={msg} maxLength={LIMITS.message} onChange={e => setMsg(e.target.value)} placeholder="Say hi, or tell them what's inside" />
    <div className="wt-opts"><div><label className="ids-label" htmlFor="wt-days">Link expires in</label><select id="wt-days" className="ids-input" value={days} onChange={e => setDays(Number(e.target.value))}>{EXPIRY_DAYS.map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}</select></div>
      <div><label className="ids-label" htmlFor={usePw ? "wt-pw" : undefined}>Password</label>{usePw ? <input id="wt-pw" className="ids-input" type="password" aria-label="Transfer password" value={pw} autoComplete="new-password" onChange={e => setPw(e.target.value)} placeholder="Choose a password" /> : <button type="button" className="iconbtn" style={{ height: 44, width: "100%" }} onClick={() => setUsePw(true)}>Add a password</button>}</div></div>
    {err && <p role="alert" className="wt-err">{err}</p>}
    {pct !== null ? <div className="wt-prog" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: pct + "%" }} /><span>Sending… {pct}%</span></div>
      : <button className="ids-btn ids-btn--primary wt-send" disabled={files.length === 0} onClick={send}>Get a link</button>}
  </div>;
}
