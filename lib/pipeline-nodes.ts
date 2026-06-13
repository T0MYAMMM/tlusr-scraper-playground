import type { PipelineNodeMeta } from './types';

export const PIPELINE_NODES: PipelineNodeMeta[] = [
  {
    id: 'crawler',
    label: 'Crawler',
    role: 'worker',
    tier: 'crawl',
    description: 'Discovers article URLs from multiple sources and enqueues them for the scraper.',
    details: [
      'Sitemap XML — parses sitemaps recursively',
      'Pagination — follows next-page CSS selectors',
      'RSS/Atom — polls feed endpoints',
      'URL deduplication via SQLite frontier',
    ],
  },
  {
    id: 'queue_c2s',
    label: 'crawler → scraper',
    role: 'queue',
    tier: 'queue',
    description: 'Filesystem queue holding UrlManifest items discovered by the crawler.',
    details: [
      'Atomic os.replace() for POSIX safety',
      'pending / processing / done / dead states',
      'Auto-recovery of stale items on startup',
      'Dead-letter queue after max_attempts',
    ],
  },
  {
    id: 'scraper',
    label: 'Scraper',
    role: 'worker',
    tier: 'scrape',
    description: 'Fetches raw HTML for each URL and writes RawDocument items to the parser queue.',
    details: [
      'HTTP engine — httpx with token-bucket rate limiting',
      'Playwright engine — JS-rendered pages',
      'User-agent rotation + realistic browser headers',
      'Adaptive delay — backs off on 429s',
    ],
  },
  {
    id: 'queue_s2p',
    label: 'scraper → parser',
    role: 'queue',
    tier: 'queue',
    description: 'Filesystem queue holding RawDocument items ready for extraction.',
    details: [
      'Same FSBroker as crawler queue',
      'Items include full HTML + metadata',
      'Envelope format: { _meta, data }',
      'Independent from scraper lifecycle',
    ],
  },
  {
    id: 'parser',
    label: 'Parser',
    role: 'worker',
    tier: 'parse',
    description: 'Extracts structured Article data from raw HTML using a confidence-cascade strategy.',
    details: [
      'tlusr-article-parsing-intelligence engine',
      'Confidence-cascade: metadata → heuristic → semantic → LLM',
      'Profiles: fast / balanced / accurate',
      'Outputs Article + ParseDiagnostics JSON',
    ],
  },
  {
    id: 'output',
    label: 'Parsed Articles',
    role: 'output',
    tier: 'output',
    description: 'Structured Article JSON files written to the output directory.',
    details: [
      'Layout: data/parsed/YYYY-MM-DD/{site}/{id}.json',
      'URL marked as scraped in SQLite frontier',
      'Full Article schema with confidence scores',
      'Browse via the Articles page',
    ],
  },
];

export const NODE_BY_ID = new Map(PIPELINE_NODES.map((n) => [n.id, n]));
