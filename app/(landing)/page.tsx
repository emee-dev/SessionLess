import Link from "next/link";

const shadowBtn =
  "shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)] transition";

const speakers = [
  {
    initials: "MK",
    avatarClass: "bg-gold/70 text-ink border-ink/20",
    name: "Mara Kessler",
    role: "Keynote · Main Stage",
    status: "confirmed",
    statusClass: "bg-accent/15 text-accent border-accent/30 rotate-1",
  },
  {
    initials: "DO",
    avatarClass: "bg-brand/20 text-brand border-brand/30",
    name: "Dev Osei",
    role: "Talk · Systems track",
    status: "travel booked",
    statusClass: "bg-gold/30 text-ink border-gold/50 -rotate-1",
  },
  {
    initials: "AR",
    avatarClass: "bg-ink/10 text-ink border-ink/20",
    name: "Ana Reyes",
    role: "Workshop · Room 2",
    status: "abstract due",
    statusClass: "bg-ink/5 text-ink/60 border-ink/20 rotate-1",
  },
];

const features = [
  {
    num: "01",
    title: "Live updates",
    body: "See speaker onboarding progress in real time and instantly spot who still has outstanding tasks.",
    cardClass: "torn bg-paper2 rotate-[-1.5deg]",
    badgeClass: "bg-brand text-paper2 border-ink",
    titleClass: "text-ink",
    bodyClass: "text-ink/70",
  },
  {
    num: "02",
    title: "Declarative forms",
    body: "Build event forms with Tiolang DSL, conditional logic, and category-based routing.",
    cardClass: "torn2 bg-accent rotate-[1deg] text-paper2",
    badgeClass: "bg-paper2 text-accent border-paper2",
    titleClass: "",
    bodyClass: "text-paper2/85",
  },
  {
    num: "03",
    title: "Event calendar",
    body: "Build schedules with drag-and-drop simplicity while automatically catching conflicts across rooms and tracks.",
    cardClass: "torn bg-gold rotate-[1.5deg]",
    badgeClass: "bg-ink text-gold border-ink",
    titleClass: "text-ink",
    bodyClass: "text-ink/70",
  },
  {
    num: "04",
    title: "Tasks & attachments",
    body: "Assign tasks, collect slides, and set deadlines all organized around each event.",
    cardClass: "torn2 bg-paper2 rotate-[-1deg]",
    badgeClass: "bg-brand text-paper2 border-ink",
    titleClass: "text-ink",
    bodyClass: "text-ink/70",
  },
  {
    num: "05",
    title: "Speaker portal",
    body: "Give speakers one place to confirm details, upload bios and headshots, and track everything they need to complete.",
    cardClass: "torn bg-paper2 rotate-[0.8deg]",
    badgeClass: "bg-accent text-paper2 border-ink",
    titleClass: "text-ink",
    bodyClass: "text-ink/70",
  },
  {
    num: "06",
    title: "Open source",
    body: "MIT licensed, transparent, and ready to self-host on your own infrastructure.",
    cardClass:
      "torn2 bg-ink rotate-[-1.2deg] text-paper2 shadow-[5px_5px_0_var(--brand)]",
    badgeClass: "bg-paper2 text-ink border-paper2",
    titleClass: "",
    bodyClass: "text-paper2/80",
  },
];

const heroTags = [
  "Real-time updates",
  "Declarative forms",
  "Speaker portal",
  "Schedules & rooms",
  "Tasks & files",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-5 pt-8 pb-16 sm:px-8">
        <div className="torn relative rotate-[-1.5deg] bg-accent p-7 text-paper2 shadow-[6px_6px_18px_rgba(36,30,20,0.18)] sm:p-10">
          <div className="tape absolute -top-3 left-10 h-6 w-24 rotate-[-8deg]" />
          <div className="tape absolute -top-3 right-12 h-6 w-24 rotate-[6deg]" />
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em]">
            Speaker CRM · built on Convex
          </p>
          <h1 className="font-sans text-[2.7rem] leading-[0.95] font-bold sm:text-[4.2rem]">
            The open-source speaker CRM that stays live.
          </h1>
          <p className="mt-5 max-w-xl font-sans text-base text-paper2/85 sm:text-lg">
            Manage speakers, tasks, attachments, and events in one real-time
            dashboard. No per-event pricing. Ever.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              href="#demo"
              className={`border-2 border-ink bg-paper px-6 py-3 font-mono font-bold text-ink ${shadowBtn}`}
            >
              See the live demo
            </a>
            <a
              href="#features"
              className="border-2 border-paper2/70 px-6 py-3 font-mono text-paper2 transition hover:bg-paper2/10"
            >
              Read the features
            </a>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
          {heroTags.map((tag, i) => (
            <span
              key={tag}
              className={`border border-ink/25 bg-paper2/60 px-3 py-1 font-mono text-xs text-ink/80 ${
                i % 2 === 0 ? "rotate-1" : "-rotate-1"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section
        id="demo"
        className="relative mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              Live demo
            </p>
            <h2 className="font-sans text-3xl font-bold text-ink sm:text-4xl">
              Follow speakers as they commit.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-ink/70">
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            realtime · convex
          </span>
        </div>
        <div className="torn2x border-2 border-ink bg-paper2 p-5 shadow-[8px_8px_0_var(--ink)] sm:p-7">
          <div className="mb-4 font-mono text-xs text-ink/50">
            /speakers/confirmations · 12 pending
          </div>
          <div className="divide-y divide-ink/10 font-mono text-sm">
            {speakers.map((s) => (
              <div
                key={s.initials}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full border font-bold text-xs ${s.avatarClass}`}
                  >
                    {s.initials}
                  </span>
                  <div>
                    <p className="font-bold text-ink">{s.name}</p>
                    <p className="text-xs text-ink/50">{s.role}</p>
                  </div>
                </div>
                <span
                  className={`border px-2 py-1 text-xs whitespace-nowrap ${s.statusClass}`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-ink/10 pt-4 font-mono text-xs text-ink/40">
            Placeholder — swap in a live embed of a sandboxed Convex deployment.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-brand">
          Features
        </p>
        <h2 className="mb-8 font-sans text-3xl font-bold text-ink sm:text-4xl">
          Everything on one paper board.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.num}
              className={`border-2x border-ink p-6 shadow-[5px_5px_0_var(--ink)] ${f.cardClass}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`grid size-9 place-items-center border-2 font-mono text-xs font-bold ${f.badgeClass}`}
                >
                  {f.num}
                </span>
                <h3 className={`font-sans text-xl font-bold ${f.titleClass}`}>
                  {f.title}
                </h3>
              </div>
              <p className={`font-sans text-sm ${f.bodyClass}`}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="relative mx-auto max-w-6xl scroll-mt-8 px-5 pb-20 sm:px-8"
      >
        <div className="torn relative rotate-[-0.8deg] bg-brand p-8 text-paper2 shadow-[8px_8px_20px_rgba(36,30,20,0.2)] sm:p-12">
          <div className="tape absolute -top-3 left-16 h-6 w-24 rotate-[-7deg]" />
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em]">
                Pricing
              </p>
              <h2 className="font-sans text-3xl leading-tight font-bold sm:text-4xl">
                One flat price. No per-event metering.
              </h2>
              <p className="mt-4 font-sans text-paper2/85">
                Run a single meetup or fifty concurrent events on the same plan.
                The ceiling is the plan — not the app.
              </p>
            </div>
            <div className="rotate-[1deg] border-2 border-ink bg-paper2 p-6 text-ink shadow-[5px_5px_0_var(--ink)]">
              <p className="mb-1 font-mono text-xs text-ink/50">Pro plan</p>
              <p className="font-sans text-4xl font-bold text-ink">
                $2,499{" "}
                <span className="font-mono text-base text-ink/50">
                  / month max
                </span>
              </p>
              <ul className="mt-4 space-y-2 font-mono text-sm text-ink/80">
                <li className="flex gap-2">
                  <span className="text-brand">—</span> Unlimited events &amp;
                  rooms
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">—</span> Full speaker portal
                  &amp; tasks
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">—</span> Open source, self-host
                  option
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CTA />

      <footer className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8">
        <div className="border-t-2 border-ink/15">
          <div className="grid gap-10 py-10 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="font-mono text-lg font-bold tracking-tight">
                sessionless
              </div>

              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/60">
                A handcut alternative to the big speaker CRMs. Simple tools for
                managing speakers, sessions, and events without the bloat.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink/50">
                Product
              </h3>

              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <Link
                  href="#features"
                  className="transition-colors hover:text-ink"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="transition-colors hover:text-ink"
                >
                  Pricing
                </Link>
                <Link href="/" className="transition-colors hover:text-ink">
                  Changelog
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink/50">
                Resources
              </h3>

              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <Link
                  href="https://github.com/emee-dev/SessionLess"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ink"
                >
                  {/* GitHub icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
                  </svg>
                  GitHub
                </Link>
                <Link href="/docs" className="transition-colors hover:text-ink">
                  Docs
                </Link>
                <Link
                  href="mailto:hello@example.com"
                  className="transition-colors hover:text-ink"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-5 border-t border-ink/10 py-6 font-mono text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>© 2026 Sessionless</span>
              <span className="hidden sm:inline">·</span>
              <a href="#" className="hover:text-ink">
                Privacy
              </a>
              <a href="#" className="hover:text-ink">
                Terms
              </a>
              <Link
                href="https://github.com/your-username/sessionless"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
                </svg>
                GitHub
              </Link>
            </div>

            <span>MIT License · Built on Convex</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Navbar() {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-9 -rotate-6 place-items-center border-2 border-ink bg-brand font-mono text-sm font-bold text-paper2 shadow-[3px_3px_0_var(--ink)]">
            Sb
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-ink">
            Sessionless
          </span>
        </div>
        <nav className="hidden items-center gap-7 font-mono text-sm text-ink/80 md:flex">
          <Link href="#features" className="hover:text-brand">
            Features
          </Link>
          <Link href="#demo" className="hover:text-brand">
            Live demo
          </Link>
          <Link href="#pricing" className="hover:text-brand">
            Pricing
          </Link>

          <span className="inline-flex rotate-1 items-center gap-2">
            <Link
              href="https://github.com/your-username/sessionless"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
              </svg>
              GitHub
            </Link>
          </span>
        </nav>
        {/* Info: Use the default link to manually load the page. Prevents landing page
        css from leaking into the dashboard styles */}

        <a
          href="/~"
          className={`border-2 border-ink bg-paper2 px-4 py-2 font-mono text-sm font-bold text-ink ${shadowBtn}`}
        >
          Dashboard
        </a>
      </div>
    </header>
  );
}

function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-8">
      <div className="torn2 flex rotate-[0.6deg] flex-col items-start justify-between gap-6 border-2 border-ink bg-paper2 p-8 shadow-[6px_6px_0_var(--ink)] sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="font-sans text-2xl font-bold text-ink sm:text-3xl">
            Ready for your next event?
          </h2>
          <p className="mt-2 font-sans text-ink/70 max-w-sm">
            Keep your speakers, schedules, and tasks in one place. Get started
            immediately.
          </p>
        </div>

        <Link
          href="/login"
          className={`shrink-0 border-2 border-ink bg-brand px-7 py-3 font-mono font-bold text-paper2 ${shadowBtn}`}
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
