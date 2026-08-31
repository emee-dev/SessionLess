**# Hackathon log**

* **Project:** SessionLess
* **Event:** Convex Hackathon
* **What it does:** Open Source SessionBoard alternative for speakers featuring live dashboard, speaker portals, declarative form creation, speaker tasks and file attachments.
* **Live app:** https://majestic-hamster-836.convex.site
* **Repo:** https://github.com/emee-dev/SessionLess
* **Frontend:** Convex static hosting
* **Convex deployment:** https://majestic-hamster-836.convex.cloud
* **Components:** @convex-dev/static-hosting
* **Convex features:** schema, tables, indexes, queries, mutations, realtime queries
* **Auth:** none
* **AI models:** none
* **Started:** 2026-08-26T10:15:00Z
* **Last updated:** 2026-08-31T14:11:21.145Z

## Log

**### 2026-08-30 - e25782a**

Initialized the Next.js 16 application with React 19, Tailwind CSS v4, and shadcn/ui component library, establishing the foundational project structure, font configuration (Geist, Inter), and core dependencies including Convex for backend integration (`README.md`, `app/layout.tsx`, `app/page.tsx`, `next.config.ts`, `package.json`). Convex features: none.

**### 2026-08-31 - c3aeed0**

Implemented a complete landing page with hero section, live demo preview showing speaker confirmations, six feature cards (live updates, declarative forms, event calendar, tasks & attachments, speaker portal, open source), pricing section with flat-rate Pro plan, CTA, and footer with navigation links. Added a responsive navbar with Dashboard link and GitHub reference. The page uses a distinctive "torn paper" visual style with custom CSS variables and shadow effects (`app/page.tsx`). Convex features: none.

**### 2026-08-31 - 003fdf3**

Implemented a Peggy.js DSL grammar for declarative form creation with a three-layer architecture: raw syntax tree types mirroring the grammar output, a shaped AST with typed nodes for fields, references, and submit events, and a semantic validation layer enforcing allowed field types, rules, and reference sources. The parser transforms raw grammar output into a structured FormAST with metadata extraction, rule scoping, and duplicate event detection, while the validator checks rule applicability, option keys, and known reference paths against a caller-supplied schema (`dsl/src/ast.ts`, `dsl/src/parser.ts`, `dsl/src/validate.ts`). Convex features: none.
