import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import type { SystemStatus, ArticleListItem, ArticleFile, SiteConfig } from './types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
const QUEUES_DIR = path.join(DATA_DIR, 'queues');
const PARSED_DIR = path.join(DATA_DIR, 'parsed');
const CONFIGS_DIR = process.env.CONFIGS_DIR || path.join(process.cwd(), '..', 'configs');

async function countJsonFiles(dir: string): Promise<number> {
  try {
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

async function queueCounts(name: string) {
  const base = path.join(QUEUES_DIR, name);
  const [pending, processing, done, dead] = await Promise.all([
    countJsonFiles(path.join(base, 'pending')),
    countJsonFiles(path.join(base, 'processing')),
    countJsonFiles(path.join(base, 'done')),
    countJsonFiles(path.join(base, 'dead')),
  ]);
  return { pending, processing, done, dead };
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const [c2s, s2p] = await Promise.all([
    queueCounts('crawler_to_scraper'),
    queueCounts('scraper_to_parser'),
  ]);
  let total = 0;
  const sites = new Set<string>();
  try {
    const dates = await readdir(PARSED_DIR);
    for (const date of dates) {
      const dp = path.join(PARSED_DIR, date);
      const ds = await stat(dp);
      if (!ds.isDirectory()) continue;
      const siteDirs = await readdir(dp);
      for (const site of siteDirs) {
        const sp = path.join(dp, site);
        const ss = await stat(sp);
        if (!ss.isDirectory()) continue;
        sites.add(site);
        total += await countJsonFiles(sp);
      }
    }
  } catch { /* ok */ }
  return {
    queues: { crawler_to_scraper: c2s, scraper_to_parser: s2p },
    total_articles: total,
    total_sites: [...sites].sort(),
    last_updated: new Date().toISOString(),
  };
}

export async function getRecentArticles(limit = 15): Promise<ArticleListItem[]> {
  const items: ArticleListItem[] = [];
  try {
    const dates = (await readdir(PARSED_DIR)).sort().reverse();
    outer: for (const date of dates) {
      const dp = path.join(PARSED_DIR, date);
      const ds = await stat(dp);
      if (!ds.isDirectory()) continue;
      const siteDirs = await readdir(dp);
      for (const site of siteDirs) {
        const sp = path.join(dp, site);
        const ss = await stat(sp);
        if (!ss.isDirectory()) continue;
        const files = await readdir(sp);
        for (const file of files.filter((f) => f.endsWith('.json'))) {
          try {
            const raw = await readFile(path.join(sp, file), 'utf-8');
            const data = JSON.parse(raw);
            const article = data.article ?? {};
            const diagnostics = data.diagnostics ?? null;
            items.push({
              id: file.replace('.json', ''),
              site,
              date,
              title: article.title ?? null,
              url: article.url ?? '',
              author: article.author ?? null,
              language: article.language ?? null,
              content_length: (article.content ?? '').length,
              confidence: diagnostics?.aggregate_confidence ?? null,
              parsed_at: article.parsed_at ?? '',
            });
            if (items.length >= limit) break outer;
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* ok */ }
  return items;
}

export async function getArticleById(id: string): Promise<ArticleFile | null> {
  try {
    const dates = (await readdir(PARSED_DIR)).sort().reverse();
    for (const date of dates) {
      const dp = path.join(PARSED_DIR, date);
      const ds = await stat(dp);
      if (!ds.isDirectory()) continue;
      const siteDirs = await readdir(dp);
      for (const site of siteDirs) {
        const filePath = path.join(dp, site, `${id}.json`);
        try {
          await stat(filePath);
          const raw = await readFile(filePath, 'utf-8');
          const data = JSON.parse(raw);
          return { id, site, date, article: data.article, diagnostics: data.diagnostics ?? null };
        } catch { /* not here */ }
      }
    }
  } catch { /* ok */ }
  return null;
}

export async function getSiteConfigs(): Promise<SiteConfig[]> {
  const configs: SiteConfig[] = [];
  try {
    // dynamic import to avoid bundling js-yaml in client components
    const yaml = await import('js-yaml');
    const files = await readdir(CONFIGS_DIR);
    for (const file of files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      try {
        const raw = await readFile(path.join(CONFIGS_DIR, file), 'utf-8');
        const parsed = yaml.load(raw) as Record<string, unknown>;
        configs.push({
          filename: file,
          site_name: String(parsed.site_name ?? file.replace(/\.ya?ml$/, '')),
          base_url: parsed.base_url ? String(parsed.base_url) : null,
          start_urls: Array.isArray(parsed.start_urls) ? parsed.start_urls.map(String) : [],
          engine: String(parsed.engine ?? 'http'),
          strategy: String((parsed.crawl_strategy as Record<string, unknown>)?.type ?? parsed.strategy ?? 'sitemap'),
          requests_per_minute: Number(parsed.requests_per_minute ?? 30),
          timeout_seconds: Number(parsed.timeout_seconds ?? 30),
          raw_yaml: raw,
        });
      } catch { /* skip */ }
    }
  } catch { /* ok */ }
  return configs;
}
