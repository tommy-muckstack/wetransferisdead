import type { Site } from "@/lib/site-types";
const GH = "https://github.com/tommy-muckstack/wetransferisdead";
export const site: Site = {
  slug: "wetransferisdead", name: "WeTransferIsDead", replaces: "WeTransfer", theme: "wetransfer",
  glyph: "M12 18 V7 M7.5 11.5 L12 7 L16.5 11.5 M6 19 H18",
  nav: [{ label: "Send", id: "send" }, { label: "How it works", id: "solutions" }, { label: "Resources", id: "resources" }, { label: "Pricing", id: "pricing" }],
  cta: "Send files",
  hero: { variant: "upload", eyebrow: "No sign-up · No ads · Open source", title: ["Send your files.", "No strings attached."], subtitle: "Add your files, get a link, and share it anywhere. You don't need an account, and it never costs a cent. Add a message, a password, and choose when the link expires.",
    primary: { label: "Send files", href: "/" }, shot: "sent.png", shotAlt: "The upload card showing a finished transfer with a copyable download link" },
  audience: "Made for designers, photographers, agencies, students, teams and anyone who has ever hit an email attachment limit",
  stepsTitle: "Sending a file takes three moves",
  steps: [{ t: "Add files", d: "Drop up to 20 files on the card, or click to choose them. Remove any you didn't mean to add." }, { t: "Set it up", d: "Write a message, pick 1, 3 or 7 days, and add a password if the files are private." }, { t: "Share the link", d: "Copy the link or open your email with it already written. No account needed." }, { t: "They download", d: "One file or everything as a zip. You can see how many times it was downloaded, and delete it any time." }],
  rows: [
    { id: "send", k: "Send", h: "One card. That's the whole product.", p: "Drag files in, press the button, get a link. Progress shows while it uploads, and the link is ready the moment it finishes.", img: "card.png", alt: "The upload card with three files added and a message", cta: "Send files" },
    { id: "download", k: "Download", h: "A clean page for the people you send to", p: "Your recipient sees your message, each file with its size, and a button for the whole lot as a zip. No ads and no sign-up on their side either.", img: "download.png", alt: "The download page with a message, three files and a download-all button", cta: "See a transfer" },
    { id: "private", k: "Private", h: "Password-protect it, or set it to expire", p: "Passwords are hashed on the server and checked before any file is served. Links expire after 1, 3 or 7 days and the files are deleted when they do.", img: "password.png", alt: "A password prompt on a protected transfer", cta: "Protect a transfer" },
    { id: "history", k: "Your transfers", h: "Sign in to keep track", p: "Log in and every transfer you send is kept in a list with its download count and time left. Copy the link again or delete it with one click.", img: "history.png", alt: "The transfers list with download counts, time left and actions", cta: "See your transfers" },
  ],
  statsTitle: "Real numbers, no fine print",
  stats: [{ b: "$0", s: "to send, forever" }, { b: "0 ads", s: "for you or for your recipient" }, { b: "20 files", s: "per transfer, up to 4 MB in total on the hosted site" }, { b: "Apache-2.0", s: "fork it, change it, ship it" }],
  integrations: { title: "A link works everywhere", text: "Paste it into email, chat, a doc or a text message. Recipients open it in any browser on any device." },
  pricing: { title: "What you'd pay to send files elsewhere", vendor: "WeTransfer", asOf: "October 2026", plans: [{ name: "Starter", perSeatMonth: 8, flat: true, note: "billed monthly, 10 transfers a month" }, { name: "Ultimate", perSeatMonth: 23, flat: true, note: "billed monthly, one person" }, { name: "Teams", perSeatMonth: 19, note: "billed monthly, 2 people minimum" }], seats: 2,
    footnote: "WeTransfer's free plan allows 10 transfers or 3 GB per 30 days. Our hosted limit is 4 MB per transfer today (self-hosting raises it), so for big files compare features, not just price.", featuresTitle: "Every feature, no plan gates",
    features: [{ name: "More than 10 transfers a month", plan: "Ultimate" }, { name: "Password-protected transfers", plan: "Ultimate" }, { name: "Choose when the link expires", plan: "Ultimate" }, { name: "Download count per transfer", plan: "Ultimate" }, { name: "Zip download for everything", plan: "Free" }, { name: "No ads on the download page", plan: "Ultimate" }] },
  finalCta: { title: "Send it. Skip the subscription.", sub: "Your first transfer is one drag away." },
  footer: [
    { title: "Product", links: [{ label: "Send", href: "/#send" }, { label: "Download page", href: "/#download" }, { label: "Privacy", href: "/#private" }, { label: "Pricing", href: "/#pricing" }] },
    { title: "Get started", links: [{ label: "Log in", href: "/login" }, { label: "Try the demo account", href: "/login" }, { label: "Price comparison", href: "/#pricing" }] },
    { title: "Open source", links: [{ label: "GitHub", href: GH }, { label: "Apache-2.0 license", href: GH + "/blob/main/LICENSE" }] },
    { title: "More IsDead apps", links: [{ label: "CalendlyIsDead", href: "/calendlyisdead" }, { label: "LinktreeIsDead", href: "/linktreeisdead" }, { label: "TrelloIsDead", href: "/trelloisdead" }, { label: "BitlyIsDead", href: "/bitlyisdead" }, { label: "LoomIsDead", href: "/loomisdead" }] },
  ],
  trademark: "WeTransferIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by WeTransfer B.V. WeTransfer is a trademark of its owner.",
  repo: GH,
};
