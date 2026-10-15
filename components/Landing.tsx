"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import "@/app/landing.css";

// Mirrors wetransfer.com for a first-time visitor: left rail, pill nav, pastel wallpaper, a terms card that becomes
// the upload card after "I agree", and the promo headline. Marketing content lives on /pricing. Art is original.
const We = ({ s = 42, r = 12 }: { s?: number; r?: number }) => <span className="wz-we" style={{ width: s, height: s, borderRadius: r, fontSize: s * 0.55 }}>we</span>;
// Original grayscale composition standing in for the editorial photo (no third-party imagery).
const Art = () => <svg className="wz-art" viewBox="0 0 755 503" preserveAspectRatio="none" aria-hidden><defs><linearGradient id="wzg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3a3a" /><stop offset=".5" stopColor="#101010" /><stop offset="1" stopColor="#070707" /></linearGradient><filter id="wzb"><feGaussianBlur stdDeviation="9" /></filter></defs><rect width="755" height="503" fill="url(#wzg)" /><g filter="url(#wzb)"><ellipse cx="610" cy="40" rx="150" ry="70" fill="#8a8a8a" /><ellipse cx="230" cy="120" rx="95" ry="85" fill="#4a4a4a" /><ellipse cx="330" cy="150" rx="60" ry="55" fill="#9a9a9a" /><ellipse cx="420" cy="200" rx="75" ry="55" fill="#bdbdbd" /><ellipse cx="470" cy="135" rx="50" ry="45" fill="#6e6e6e" /><ellipse cx="610" cy="230" rx="80" ry="70" fill="#8d8d8d" /><ellipse cx="560" cy="320" rx="95" ry="30" fill="#2a2a2a" /><ellipse cx="150" cy="320" rx="130" ry="40" fill="#555" /></g></svg>;
const rail: [string, React.ReactNode][] = [
  ["Send", <svg key="s" width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="6" fill="#3767EA" /><path d="M12 17V8M8 11.5l4-4 4 4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>],
  ["Request", <svg key="r" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#111" strokeWidth="2" /><path d="M12 7v7M9 12l3 3 3-3" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>],
  ["Albums", <svg key="a" width="24" height="24" viewBox="0 0 24 24"><rect x="4" y="4" width="14" height="13" rx="4" fill="none" stroke="#111" strokeWidth="2" /><circle cx="19" cy="19" r="2" fill="#111" /></svg>],
  ["Showcase", <svg key="c" width="24" height="24" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="7" rx="3" fill="none" stroke="#111" strokeWidth="2" /><path d="M12 10v5M7 21h10M9 15h6l1 6H8z" fill="none" stroke="#111" strokeWidth="2" strokeLinejoin="round" /></svg>],
  ["Sign", <svg key="g" width="24" height="24" viewBox="0 0 24 24"><path d="M5 19c4-1 10-8 13-14l2 1c-2 6-8 12-12 14zM3 21h5" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>],
];
const Dn = () => <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden style={{ marginLeft: 8 }}><path d="M1 1l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;

export function Landing() {
  const [agreed, setAgreed] = useState(false);
  useEffect(() => { try { setAgreed(localStorage.getItem("wz-agreed") === "1"); } catch { /* ignore */ } }, []);
  const agree = () => { setAgreed(true); try { localStorage.setItem("wz-agreed", "1"); } catch { /* ignore */ } };
  return <div className="wz">
    <aside className="wz-rail"><Link href="/" className="wz-rail__logo" aria-label="Home"><span>we</span></Link>
      <nav>{rail.map(([l, i], n) => <Link key={l} href="/login" className={n === 0 ? "on" : ""}>{i}<small>{l}</small></Link>)}</nav>
      <div className="wz-rail__bot"><button aria-label="Notifications"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15zM10 21h4" fill="none" stroke="#676767" strokeWidth="1.8" strokeLinejoin="round" /></svg><i>3</i></button><button aria-label="Help"><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#676767" strokeWidth="1.8" /><path d="M10 9.5a2 2 0 114 0c0 1.5-2 1.6-2 3.2M12 16v.5" fill="none" stroke="#676767" strokeWidth="1.8" strokeLinecap="round" /></svg></button><button aria-label="Collapse"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M10 12H4M7 9l-3 3 3 3M15 5v14" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" /></svg></button></div></aside>
    <header className="wz-top"><button className="wz-burger" aria-label="Menu"><i /><i /><i /></button><Link href="/" className="wz-top__logo"><We s={30} r={9} /></Link>
      <div className="wz-pill"><button>Features<Dn /></button><Link href="/pricing">Pricing</Link><button>Use cases<Dn /></button><button>Resources<Dn /></button></div>
      <div className="wz-pill wz-pill--auth"><Link href="/login">Log in</Link><Link className="wz-dark" href="/login?mode=signup">Sign up</Link></div></header>
    <main className="wz-main">
      <Link href="/pricing" className="wz-look"><span>Take<br />a<br />look</span></Link>
      <p className="wz-wp"><span>WEPRESENT</span><small>by WeTransfer</small></p>
      <section className={"wz-card" + (agreed ? " wz-card--up" : "")}>
        {agreed ? <UploadCard /> : <>
          <We s={42} r={13} />
          <h1 className="wz-d">You’re<br /><b>almost</b> there</h1><h1 className="wz-m">The simplest way to send big files</h1>
          <p>To continue, please agree to our <Link href="/pricing">Terms of Service</Link>, and acknowledge our <Link href="/pricing">Privacy Policy</Link>.</p>
          <button className="wz-agree" onClick={agree}>I agree</button></>}
      </section>
      <figure className="wz-photo"><Art /><figcaption><b>World Press Photo 2026</b><span>A photographer documents the resilient families living in improvised housing on the edge of town.</span></figcaption></figure>
    </main>
    
  </div>;
}
