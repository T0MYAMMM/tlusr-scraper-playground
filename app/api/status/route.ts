import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
const QUEUES_DIR = path.join(DATA_DIR, 'queues');
const PARSED_DIR = path.join(DATA_DIR, 'parsed');

async function countJsonFiles(dir: string): Promise<number> {
  try {
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

async function countQueueFiles(queueName: string) {
  const base = path.join(QUEUES_DIR, queueName);
  const [pending, processing, done, dead] = await Promise.all([
    countJsonFiles(path.join(base, 'pending')),
    countJsonFiles(path.join(base, 'processing')),
    countJsonFiles(path.join(base, 'done')),
    countJsonFiles(path.join(base, 'dead')),
  ]);
  return { pending, processing, done, dead };
}

async function scanParsedDir() {
  let total = 0;
  const sites = new Set<string>();
  try {
    const dates = await readdir(PARSED_DIR);
    for (const date of dates) {
      const datePath = path.join(PARSED_DIR, date);
      const s = await stat(datePath);
      if (!s.isDirectory()) continue;
      const siteDirs = await readdir(datePath);
      for (const site of siteDirs) {
        const sitePath = path.join(datePath, site);
        const ss = await stat(sitePath);
        if (!ss.isDirectory()) continue;
        sites.add(site);
        total += await countJsonFiles(sitePath);
      }
    }
  } catch {
    // parsed dir may not exist yet
  }
  return { total, sites: [...sites].sort() };
}

export async function GET() {
  const [c2s, s2p, parsed] = await Promise.all([
    countQueueFiles('crawler_to_scraper'),
    countQueueFiles('scraper_to_parser'),
    scanParsedDir(),
  ]);

  return NextResponse.json({
    queues: {
      crawler_to_scraper: c2s,
      scraper_to_parser: s2p,
    },
    total_articles: parsed.total,
    total_sites: parsed.sites,
    last_updated: new Date().toISOString(),
  });
}
