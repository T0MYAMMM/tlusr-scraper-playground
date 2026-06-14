# tlusr-scraper-web

A **Next.js 15 dashboard** for the Tlusr Scraping System. It visualises the
`Crawler → Scraper → Parser` pipeline, monitors the filesystem queues in
real time, and lets you browse the structured articles the parser produces.

This is a **read-only viewer** — it does not run the pipeline. It reads the
output the Python workers write to disk (queue files, parsed JSON, and the
per-site YAML configs) and presents it in the browser.

```
   Python workers (separate repo)            This web app
   ────────────────────────────             ─────────────
   crawler ─► scraper ─► parser  ──writes──►  data/  ──reads──►  Dashboard
                                              configs/           Pipeline view
                                                                 Article browser
                                                                 Config viewer
```

---

## Quick start

Requires **Node.js 18.18+** (Next.js 15) and npm.

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
```

By default the app looks for the scraper's output one directory up
(`../data` and `../configs`). Point it elsewhere with environment variables
(see [Data source](#data-source)):

```bash
DATA_DIR=/abs/path/to/data CONFIGS_DIR=/abs/path/to/configs npm run dev
```

If those directories don't exist yet, the app still runs — every view
degrades gracefully to empty state (zero counts, no articles).

### Scripts

| Command             | Action                                      |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server with Turbopack                   |
| `npm run build`     | Production build                            |
| `npm run start`     | Serve the production build                  |
| `npm run lint`      | ESLint (`eslint-config-next`)               |
| `npm run typecheck` | `tsc --noEmit`                              |

---

## Tech stack

- **Framework** — Next.js 15 (App Router, React Server Components), React 18, TypeScript
- **Styling** — Tailwind CSS 3 + `tailwindcss-animate`, dark theme by default
- **UI primitives** — Radix UI (dialog, tabs, tooltip, scroll-area, separator, slot) wrapped in local `components/ui/*`
- **Pipeline graph** — [`@xyflow/react`](https://reactflow.dev) (React Flow)
- **Config viewer** — `@monaco-editor/react`
- **Motion / icons** — `framer-motion`, `lucide-react`
- **Parsing / validation** — `js-yaml`, `zod`

---

## Routes

| Route             | Type            | Description                                                                 |
| ----------------- | --------------- | --------------------------------------------------------------------------- |
| `/`               | Dashboard       | Queue stats, system metrics, recent articles. Revalidates every 10s.        |
| `/pipeline`       | Pipeline view   | Interactive React Flow graph of the pipeline; click a node for details. 10s.|
| `/articles`       | Article browser | Searchable, paginated list (client-fetched via `/api/articles`).            |
| `/articles/[id]`  | Article detail  | Full parsed `Article` + parse diagnostics for one document.                 |
| `/configs`        | Config viewer   | Per-site YAML configs rendered in Monaco. Revalidates every 60s.            |
| `/docs`           | Docs            | Static reference describing the backend pipeline and its CLIs.              |

Server-rendered pages (`/`, `/pipeline`, `/configs`) read the filesystem
directly through `lib/server-data.ts`. The Articles browser is a client
workspace that calls the API routes below.

## API routes

All are `GET`, read-only, and return JSON.

| Endpoint              | Query params                          | Returns                                                              |
| --------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `/api/status`         | —                                     | Queue counts (`pending/processing/done/dead`), total articles, sites |
| `/api/articles`       | `page`, `limit` (≤50), `q`, `site`    | Paginated `ArticleListItem[]` + `total`                              |
| `/api/articles/[id]`  | —                                     | Full article file (`article` + `diagnostics`), or `404`             |
| `/api/configs`        | —                                     | Parsed per-site config summaries + `raw_yaml`                        |

---

## Data source

The app reads two directories produced by the scraper backend. Paths default
to the parent directory and are overridable via env vars (wired in
`next.config.mjs`):

| Env var       | Default              | Holds                                  |
| ------------- | -------------------- | -------------------------------------- |
| `DATA_DIR`    | `../data`            | Filesystem queues + parsed article JSON|
| `CONFIGS_DIR` | `../configs`         | Per-site YAML scraper configs          |

Expected on-disk layout:

```
data/
├── queues/
│   ├── crawler_to_scraper/{pending,processing,done,dead}/*.json
│   └── scraper_to_parser/{pending,processing,done,dead}/*.json
└── parsed/
    └── YYYY-MM-DD/
        └── {site}/
            └── {id}.json        # { article: {...}, diagnostics: {...} }

configs/
└── {site}.yaml                   # site_name, engine, start_urls, strategy, …
```

Queue health is computed by counting `*.json` files in each state directory;
articles are discovered by walking `parsed/<date>/<site>/`. The shapes the app
expects are defined in [`lib/types.ts`](lib/types.ts).

---

## Project structure

```
.
├── app/
│   ├── api/                  # Route handlers (status, articles, articles/[id], configs)
│   ├── articles/             # List page + [id] detail + client workspace
│   ├── configs/              # Config viewer page + client workspace
│   ├── docs/                 # Static docs page
│   ├── pipeline/             # React Flow pipeline page
│   ├── layout.tsx            # Root layout, fonts, header/footer, dark theme
│   ├── page.tsx              # Dashboard (home)
│   └── globals.css
├── components/
│   ├── dashboard/            # queue-stats, system-metrics, recent-articles
│   ├── pipeline/             # visualizer, node, stage-details-panel
│   ├── articles/             # article-card, article-detail
│   ├── configs/              # config-viewer (Monaco)
│   ├── layout/               # site-header
│   └── ui/                   # Radix-based primitives (button, card, tabs, …)
└── lib/
    ├── server-data.ts        # Filesystem readers used by server components
    ├── pipeline-nodes.ts     # Static pipeline node metadata for the graph
    ├── types.ts              # Shared TypeScript interfaces
    └── utils.ts              # cn() and helpers
```

The `@/*` import alias maps to the project root (see `tsconfig.json`).

---

## Notes

- The backend Python workers, their CLIs (`tlusr-crawl` / `tlusr-scrape` /
  `tlusr-parse`), configs, and architecture live in a **separate repository**.
  The `/docs` page summarises them for convenience.
- A `pyproject.toml` / `poetry.lock` may be present in this directory left over
  from scaffolding; they are not used by this web app.
```

---
Part of the **[Tlusr platform](https://github.com/T0MYAMMM/tlusr-platform)**. Standards: [STANDARDS.md](https://github.com/T0MYAMMM/tlusr-platform/blob/main/STANDARDS.md) · Architecture: [ARCHITECTURE.md](https://github.com/T0MYAMMM/tlusr-platform/blob/main/ARCHITECTURE.md) · Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md) · Agents: [AGENTS.md](./AGENTS.md)
