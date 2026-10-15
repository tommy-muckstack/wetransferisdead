"use client";
// WeTransfer-style sign-in: small "we" mark, serif wordmark, narrow centred column.
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { useAuth } from "@/components/useAuth";

const GG = <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
const SL = <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden><rect x="9.500" y="1" width="4" height="9" rx="2" fill="#36c5f0" /><rect x="14" y="9.500" width="9" height="4" rx="2" fill="#2eb67d" /><rect x="10.500" y="14" width="4" height="9" rx="2" fill="#ecb22e" /><rect x="1" y="10.500" width="9" height="4" rx="2" fill="#e01e5a" /></svg>;
const AP = <svg width="16" height="19" viewBox="0 0 24 24" aria-hidden><path fill="#111" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.200c.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.900zM14.100 5.700c.6-.8 1.100-1.900.9-3-.9 0-2.100.6-2.700 1.400-.6.700-1.100 1.800-1 2.900 1 .1 2.100-.5 2.800-1.300z" /></svg>;
export function AuthScreen({ config, demo, to, signup = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean }) {
  const a = useAuth({ config, demo, to, signup });
  const su = a.mode === "signup", reset = a.mode === "reset";
  const ready = a.email.trim().length > 3;
  const off = { "aria-disabled": true, title: "Not available yet in the open-source version", onClick: a.off } as const;
  return <main className="wta">
    <Link href="/" className="wta-we" aria-label="Home">we</Link>
    <div className="wta-col">
      <div className="wta-mark">WeTransfer</div>
      <h1>{reset ? "Reset password" : su ? "Sign Up" : "Sign In"}</h1>
      <p className="wta-sub">{reset ? "and we’ll email you a reset link." : su ? "to start sending with WeTransfer." : "to continue to your WeTransfer account."}</p>
      <form onSubmit={a.submit(true)}>
        <input type="email" required autoComplete="email" placeholder="Email" aria-label="Email" value={a.email} onChange={e => a.setEmail(e.target.value)} readOnly={a.step === 2} className="wta-in" />
        {a.step === 2 && !reset && <input type="password" required minLength={6} autoFocus placeholder="Password" aria-label="Password" value={a.password} onChange={e => a.setPassword(e.target.value)} autoComplete={su ? "new-password" : "current-password"} className="wta-in" />}
        <button className={`wta-cta${ready ? " on" : ""}`} disabled={a.busy}>{reset ? "Send reset link" : a.step === 2 && su ? "Create account" : a.step === 2 ? "Log in" : "Continue"}</button>
        {!reset && <button type="button" className="wta-code" {...off}>Get a login code</button>}
      </form>
      {a.err && <p role="alert" className="wta-err">{a.err}</p>}{a.note && <p role="status" className="wta-ok">{a.note}</p>}
      {!su && !reset && <a href="#" className="wta-fg" onClick={a.go("reset")}>Forgot password?</a>}
      {reset && <a href="#" className="wta-fg" onClick={a.go("signin")}>Back to sign in</a>}
      {!reset && <><div className="wta-or"><i /><span>or</span><i /></div>
        <button type="button" className="wta-prov" onClick={a.google} disabled={a.busy}>{GG}<span>Continue with Google</span></button>
        <button type="button" className="wta-prov" {...off}>{SL}<span>Continue with Slack</span></button>
        <button type="button" className="wta-prov" {...off}>{AP}<span>Continue with Apple</span></button>
        <p className="wta-sw">{su ? <>Already have an account? <a href="#" onClick={a.go("signin")}>Sign in</a>.</> : <>Don’t have an account? <a href="#" onClick={a.go("signup")}>Sign up</a>.</>}</p></>}
      {a.demo && <button type="button" className="wta-demo" onClick={a.useDemo}>Use the demo account</button>}
    </div>
    <footer className="wta-foot"><span>©2026 WeTransfer</span><span><a href="#" onClick={a.off}>Privacy</a><a href="#" onClick={a.off}>Terms</a></span></footer>
    {!a.configured && <p className="wta-cfg" role="status">Sign-in isn’t configured on this deployment yet.</p>}
  </main>;
}
