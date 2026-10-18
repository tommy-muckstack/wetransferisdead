# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how WeTransferIsDead follows it.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` (the project's publishable token) and `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com` are set on the Vercel project. No key → analytics is a no-op.
- Requests go through this app's own origin: `<basePath>/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true`).
- `<Analytics />` and `<LinkTracking />` are mounted once in `app/layout.tsx`. `Analytics` sends PostHog's `$pageview` per route change. Autocapture, session replay, heatmaps and web-vitals capture are off.
- Privacy: `scrub` (before_send) keeps only origin + path in URL properties, drops `title`, and masks private path segments (`/t/<id>` download links work like passwords, so they become `/t/:id`).
- posthog-js drops automated browsers. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets Playwright capture (used by the kit's `ph-check.mjs`); production keeps the bot filter.

## Super properties (registered on every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `wetransferisdead` | the one property to filter by |
| `surface` | `landing` \| `app` | `landing` = marketing pages, pricing, compare, login; `app` = the transfer list `/app` and the public download pages `/t/<id>` |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered in the app header; only `firebase` users are identified |

## Identity
Signed-in users are identified by Firebase uid (`IdentifyUser` in `components/AppHeader.tsx`). Guests and the demo account are never identified; `account_type` is registered instead. Sign-out sends `app_signed_out` and calls `reset()` before the logout form posts.

## Events
| event | properties | where |
| --- | --- | --- |
| `landing_cta_clicked` | `target` (`login`, `signup`, `pricing`, `compare`, `app`), `placement` | any marketing link |
| `app_signed_up` | `method` (`password`) | `components/useAuth.ts` (sent before the redirect) |
| `app_signed_in` | `method` (`password`, `google`) | `components/useAuth.ts` |
| `app_signed_out` | | `components/AppHeader.tsx` |
| `app_transfer_created` | `files`, `total_mb`, `expiry_days`, `password`, `has_message` | `components/UploadCard.tsx` (landing page or `/app`; `surface` follows the page) |
| `app_transfer_deleted` | `via` (`sent_card`, `history`) | `UploadCard.tsx`, `Transfers.tsx` |
| `app_shared` | `method` (`copy_link`, `email`), `via` (`sent_card`, `history`) | `UploadCard.tsx`, `Transfers.tsx` |
| `app_transfer_viewed` | `files`, `locked` | `components/DownloadPage.tsx` (recipient opens `/t/<id>`) |
| `app_transfer_unlocked` | | `DownloadPage.tsx` |
| `app_transfer_downloaded` | `mode` (`file`, `zip`), `files` | `DownloadPage.tsx` |

## Rules
- Event names are `app_<object>_<action>` / `landing_<object>_<action>`, snake_case, past tense, never containing the product name. They are defined only in `lib/analytics/taxonomy.ts`; the unit test enforces the prefixes.
- Properties are kinds, counts, ids and booleans only. Never titles, file names, messages, comment text, emails or URLs. Don't use the legacy super-property names (`source`, `app`, `app_id`, `site_id`, `environment`) as event properties.
- `landing_cta_clicked` / `landing_download_clicked` come from one delegated click listener (`LinkTracking` in `lib/analytics/posthog.tsx`) that classifies `<a>` destinations, so new marketing links are tracked without code. `placement` is the page region (`nav`, `footer`, or the enclosing section's id/class).

## Where the calls live
`lib/analytics/` (client, taxonomy, link tracking, scrub). Tests: `tests/unit/analytics.test.ts`.
