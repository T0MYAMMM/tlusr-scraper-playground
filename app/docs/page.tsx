import type { Metadata } from 'next';
import { BookOpen, Terminal, Settings2, Layers, Zap, GitBranch } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Docs' };

const SECTIONS = [
  {
    icon: Terminal,
    title: 'Quick Start',
    description: 'Run the full Crawler → Scraper → Parser pipeline in minutes.',
    items: [
      'poetry install --with parser',
      'tlusr-crawl run --config configs/tribunnews_sitemap.yaml --out-queue data/queues/crawler_to_scraper',
      'tlusr-scrape run --in-queue data/queues/crawler_to_scraper --out-queue data/queues/scraper_to_parser',
      'tlusr-parse run --in-queue data/queues/scraper_to_parser --output-dir data/parsed --once',
    ],
  },
  {
    icon: Settings2,
    title: 'Site Config',
    description: 'YAML configuration schema for each news source.',
    items: [
      'site_name — unique identifier (used in output paths)',
      'start_urls — seed URLs for the crawler',
      'engine — "http" (default) or "playwright" (JS-rendered)',
      'crawl_strategy.type — sitemap | pagination | rss',
      'requests_per_minute — rate limit (default: 30)',
      'article_link_selector — CSS selector for article links',
    ],
  },
  {
    icon: Layers,
    title: 'Pipeline Architecture',
    description: 'Three independent workers connected by filesystem queues.',
    items: [
      'Crawler — discovers URLs, writes UrlManifest to queue',
      'Scraper — fetches HTML, writes RawDocument to queue',
      'Parser — extracts Article + Diagnostics JSON to disk',
      'FSBroker — atomic POSIX rename, dead-letter after max_attempts',
      'SQLite frontier — URL deduplication across runs',
    ],
  },
  {
    icon: Zap,
    title: 'Anti-Bot Plugins',
    description: 'Stackable header plugins for realistic browser fingerprinting.',
    items: [
      'UserAgentRotator — cycles Chrome/Safari/Firefox UAs',
      'HeaderEnricher — adds Accept, Accept-Language, Sec-Fetch-* headers',
      'AdaptiveDelay — jitter + 429-triggered backoff',
      'ProxyRotator — optional proxy pool rotation',
      'AsyncTokenBucket — true concurrent rate limiting',
    ],
  },
  {
    icon: GitBranch,
    title: 'Crawl Strategies',
    description: 'Choose the right strategy for each site.',
    items: [
      'sitemap — parses sitemap.xml recursively (best for SEO-friendly sites)',
      'pagination — follows next-page CSS selectors on listing pages',
      'rss — polls RSS/Atom feeds (lowest server load)',
      'search — broad crawl via search engine APIs (Phase 5, not yet implemented)',
    ],
  },
  {
    icon: BookOpen,
    title: 'Output Schema',
    description: 'Parsed article JSON structure written to data/parsed/.',
    items: [
      'article.title, subtitle, summary, content, content_markdown',
      'article.author, authors[], publish_date, language',
      'article.categories[], tags[], images[], references[]',
      'diagnostics.aggregate_confidence — 0.0–1.0 extraction quality',
      'diagnostics.timings_ms — per-stage execution times',
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-6 py-8">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold gradient-text">Documentation</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference guide for the Tlusr Scraping System
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map(({ icon: Icon, title, description, items }) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10">
                  <Icon className="h-3.5 w-3.5 text-cyan-300" />
                </div>
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400/60" />
                    <code className="font-mono leading-relaxed">{item}</code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
