# WeTransferIsDead

Free, open-source file transfer: add files, get a link, share it. Part of [IsDead](https://yourappisdead.com): open-source clones of paid SaaS. Served at `https://yourappisdead.com/wetransferisdead`; download pages live at `/wetransferisdead/t/<id>`.

- **Homepage** (`/`): mirrors WeTransfer's layout (the upload card sits in the hero and works signed out, how-it-works steps, feature rows, stats, price comparison at `#pricing`) with original copy and art.
- **Login** (`/login`): shared IsDead Firebase auth (email/password + Google); one demo account in demo mode.
- **Send** (home card and `/app`): multi-file picker or drag and drop, optional message, expiry (1, 3 or 7 days), optional password, real upload progress, a copyable link and a mailto "Email it" button. No account needed.
- **Download page** (`/t/<id>`): file list with sizes, the sender's message, per-file download and a streamed `.zip` of everything. Password-protected transfers are gated by a scrypt-hashed password and an HMAC unlock cookie. Expired or deleted transfers show a clear "gone" page.
- **Delete:** the sender gets a private delete key (held in their browser) and can kill the link at any time. Signed-in users also get a history with download counts.
- **Safety:** file names are sanitised, size and count limits are enforced on the server, paths never come from user input, and passwords are never stored or logged in plain text.

Design: theme `wetransfer` in `vendor/isdead-design` (canonical `/workspace/isdead-design`); font Familjen Grotesk (OFL) as a lookalike for WeTransfer's proprietary face.

## Run

```
npm ci
npm run dev            # http://localhost:3000/wetransferisdead  (demo account in dev)
npm test && npm run typecheck
npm run build && npm run shots   # production smoke test (real upload, download, zip, password, delete) + screenshots
```

Env (production): `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `AUTH_SECRET`, optional `DEMO_MODE=1`, `ISDEAD_DATA_DIR`.

## Gaps

- **Storage:** files and metadata are written to local disk (`ISDEAD_DATA_DIR`); Vercel's disk is ephemeral and request bodies are capped at 4.5 MB, so production needs object storage (S3/R2/GCS with signed upload URLs) and Firestore for metadata.
- **Limit:** 100 MB per transfer in this build, not WeTransfer's 2 GB / 200 GB tiers.
- **Not built:** server-sent email delivery (the link is shared by you), virus scanning, resumable uploads, previews, branded download pages, and a persistent rate limiter (the current one is per-process).
- Expired files are removed lazily on access; add a scheduled sweep in production.
- Sign-in has not been tested against the live Firebase project (keys pending).

Not affiliated with WeTransfer. Apache-2.0.
