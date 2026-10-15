import type { AuthCfg } from "@/components/AuthScreen";
export const authCfg: AuthCfg = { layout: "center", accent: "#409fff", ctaBg: "#409fff", radius: 6, ink: "#17181a", muted: "#6b6e73", logoCenter: true, logoSize: 30,
  title: "Sign in", signupTitle: "Create account", sub: "Sign in to your account.", providersAfter: true, emailFirst: true,
  providers: [{ id: "google", label: "Continue with Google" }, { id: "slack", label: "Continue with Slack" }, { id: "apple", label: "Continue with Apple" }], ctaNext: "Continue", cta: "Sign in", switchText: ["Don't have an account?", "Sign up"] };
