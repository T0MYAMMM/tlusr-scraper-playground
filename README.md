# tlusr-scraping-system

Modular news acquisition platform for Indonesian portals.  Decomposes the
old monolithic scraper into three independently-scalable workers
connected by message queues:

```
  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │  tlusr-crawl │ ─────► │ tlusr-scrape │ ─────► │  tlusr-parse │
  │  (discover)  │  URL   │   (fetch)    │  raw   │  (extract)   │
  │              │ manif. │              │  HTML  │              │
  └──────────────┘  queue └──────────────┘  queue └──────┬───────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 ▼
                       data/tlusr.db (SQLite)
                       data/parsed/   (JSON)
```

Each worker is a separate Python package with its own CLI, deployable
independently — they communicate via filesystem queues today and via
Kafka/PubSub tomorrow without code changes (see *Hexagonal Architecture*
below).

> **Catatan (id):** Platform akuisisi berita modular.  Tiga worker terpisah
> (penemuan URL → pengambilan HTML → ekstraksi terstruktur) berkomunikasi
> via antrian sehingga setiap tahap dapat diskalakan sendiri.

---

## Quick start

```bash
poetry install
pip install -e ../tlusr-article-parsing-intelligence   # parser worker only
playwright install chromium                            # if using Playwright

# 1. Discover URLs
tlusr-crawl run \
  --config configs/tribunnews_sitemap.yaml \
  --out-queue data/queues/crawler_to_scraper \
  --db data/tlusr.db \
  --max-urls 50

# 2. Fetch HTML (run continuously, or --once to drain)
tlusr-scrape run \
  --in-queue  data/queues/crawler_to_scraper \
  --out-queue data/queues/scraper_to_parser \
  --configs-dir configs/ \
  --workers 4

# 3. Parse to structured JSON
tlusr-parse run \
  --in-queue   data/queues/scraper_to_parser \
  --output-dir data/parsed \
  --once
```

All three CLIs accept `--log-level` and `--structured-logs` (JSON for
Google Cloud Logging).

---

## Architecture

### Hexagonal (ports & adapters)

Business logic depends only on Protocols defined in
[`shared/ports/`](shared/ports).  Concrete adapters live in
[`shared/adapters/`](shared/adapters) and are wired at the composition
root (the CLI `run` commands).  Swapping SQLite → Postgres or FSQueue →
Kafka is a one-binding change in the runner — no business-logic edit.

| Port                                           | Adapter (current)                           | Future                          |
| ---------------------------------------------- | ------------------------------------------- | ------------------------------- |
| `MessageBroker`                                | `FSBroker` (filesystem, atomic rename)      | `KafkaBroker`, `PubSubBroker`   |
| `UrlFrontierPort`                              | `SqliteUrlFrontier`                         | `PostgresUrlFrontier`           |
| `ScrapeJobsPort`                               | `SqliteScrapeJobs`                          | `PostgresScrapeJobs`            |
| `CrawlSessionPort`                             | `SqliteCrawlSession`                        | `PostgresCrawlSession`          |
| `RateLimitCoordinator` (`tlusr_crawler`)       | `InMemoryRateLimitCoordinator`              | `RedisRateLimitCoordinator`     |

### Boundary contracts

Two immutable Pydantic models cross worker boundaries — they are the
*only* coupling between contexts:

- [`shared.models.url_manifest.UrlManifest`](shared/models/url_manifest.py)
  — Crawler → Scraper.  One URL, plus the metadata the Scraper needs to
  decide *how* to fetch (render hint, priority, strategy of origin).
- [`shared.models.raw_document.RawDocument`](shared/models/raw_document.py)
  — Scraper → Parser.  Fetched HTML plus provenance (manifest_id,
  http_status, content_type, crawl_timestamp).

Both serialise via `to_queue_dict()` / `from_queue_dict()` so any broker
can ship them as JSON.

### Resilience

- **Dead-letter queue**: `FSBroker` tracks an attempt counter inside each
  payload envelope; exhausted items go to `dead/` rather than burning a
  worker forever on a poison message.  Bad config (missing `site_name`)
  is dead-lettered immediately — there's no point in retrying.
- **Stale-claim recovery**: `recover_stale(older_than_seconds=...)`
  reclaims items abandoned by crashed workers, but not items currently
  being processed.
- **At-least-once delivery**: every transition is an atomic `os.replace`;
  workers ack only after the outbound enqueue succeeds.

### Rate limiting

A real `AsyncTokenBucket`
([tlusr_scraper/rate_limiter.py](tlusr_scraper/rate_limiter.py))
enforces `requests_per_minute` per site while allowing concurrent
in-flight requests — the previous `Semaphore(1) + sleep` implementation
was a single-flight serializer, not a rate limit.

Phase 5 introduces a `RateLimitCoordinator` for cross-domain budgets
shared across workers; the in-memory implementation is wired today,
Redis is the future multi-pod adapter.

### Observability

Structured JSON logging shaped for Google Cloud Logging
([shared/observability/logging.py](shared/observability/logging.py)).
Correlation IDs (`session_id`, `manifest_id`, `job_id`, `site`,
`worker_id`) propagate automatically through every log line via
`contextvars` ([shared/observability/context.py](shared/observability/context.py))
— no manual `extra={}` plumbing required.

---

## Repository map

```
tlusr-scraping-system/
├── configs/                       # YAML site configs (declarative)
├── docs/                          # Phase-by-phase design notes
├── shared/
│   ├── adapters/                  # FSBroker, Sqlite* — concrete I/O
│   ├── db/                        # migrations + connection helper
│   ├── models/                    # UrlManifest, RawDocument
│   ├── observability/             # structured logging + correlation
│   ├── ports/                     # Protocols (MessageBroker, …)
│   ├── queue/                     # legacy import path (re-exports)
│   └── schemas/                   # SiteConfig (Pydantic)
├── tests/                         # 45 cases, pytest-asyncio
├── tlusr_crawler/                 # see tlusr_crawler/README.md
├── tlusr_scraper/                 # see tlusr_scraper/README.md
└── tlusr_parser_worker/           # adapter onto tlusr_parser package
```

---

## Configuration

All scraping behaviour — selectors, pagination, retries, anti-bot
delays, proxy rotation, browser settings — lives in per-site YAML files
under [`configs/`](configs).  No per-site Python code; the schema is
defined in [`shared/schemas/site_config.py`](shared/schemas/site_config.py)
and validated on load.

A minimal example:

```yaml
site_name: example_news
engine: http                    # or 'playwright' for JS-rendered sites
start_urls:
  - https://example.com/news
article_link_selector: "article h2 a"
article:
  title:        { selector: "h1.article-title" }
  content:      { selector: "div.article-body" }
  published_at: { selector: "time", attribute: datetime }
pagination:
  type: sitemap                 # sitemap | rss | next_button | url_pattern
  sitemap_filter: "/news/"
requests_per_minute: 30
delay:
  min_seconds: 0.5
  max_seconds: 2.0
```

Validate a config without crawling:

```bash
tlusr-crawl validate configs/tribunnews_sitemap.yaml
```

---

## Tests

```bash
poetry run pytest tests/ -v
```

45 cases cover broker invariants, port compliance, rate-limiter
behaviour, sitemap traversal, engine factory, anti-bot composition,
correlation context, scraper-runner integration, and schema migrations.

---

## Roadmap

| Phase | Status     | Scope                                                       |
| ----- | ---------- | ----------------------------------------------------------- |
| 1     | ✅ Done    | Foundation: FSBroker, SQLite, shared models/schemas         |
| 2     | ✅ Done    | Crawler: sitemap / pagination / RSS strategies              |
| 3     | ✅ Done    | Scraper: HTTP + Playwright engines, anti-bot plugins        |
| 4     | ✅ Done    | Parser worker (depends on `tlusr_parser` package)           |
| 5     | 🚧 Stubs   | Broad crawl: `SearchCrawlStrategy`, `CrawlBudget`, coord.   |

Phase-by-phase design docs are under [`docs/`](docs).
