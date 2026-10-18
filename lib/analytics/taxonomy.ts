// Analytics taxonomy for the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md, see docs/ANALYTICS.md).
// Super properties: product (this app's slug), surface ("landing" = logged-out marketing pages, "app" = the working product
// and anything it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Never send user content (titles, URLs, emails, text) as properties.
export const APP = "wetransferisdead" as const;
export type Surface = "landing" | "app";
export const EVENTS = {
  app_signed_up: "app_signed_up",       // method ("password" | "google")
  app_signed_in: "app_signed_in",       // method ("password" | "google")
  app_signed_out: "app_signed_out",
  // transfers (sender)
  app_transfer_created: "app_transfer_created",       // files (count), total_mb (int), expiry_days, password (bool), has_message (bool)
  app_transfer_deleted: "app_transfer_deleted",       // via ("sent_card" | "history")
  app_shared: "app_shared",                           // method ("copy_link" | "email"), via ("sent_card" | "history")
  // public download page /t/<id> (recipients)
  app_transfer_viewed: "app_transfer_viewed",         // files (count), locked (bool)
  app_transfer_unlocked: "app_transfer_unlocked",
  app_transfer_downloaded: "app_transfer_downloaded", // mode ("file" | "zip"), files (count)
  landing_cta_clicked: "landing_cta_clicked", // target ("login" | "signup" | "pricing" | "compare" | "app"), placement
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment", "ads_blocked", "account_type"] as const;
