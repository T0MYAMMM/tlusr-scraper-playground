import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const CONFIGS_DIR = process.env.CONFIGS_DIR || path.join(process.cwd(), '..', 'configs');

export async function GET() {
  const configs = [];
  try {
    const files = await readdir(CONFIGS_DIR);
    for (const file of files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      try {
        const raw = await readFile(path.join(CONFIGS_DIR, file), 'utf-8');
        const parsed = yaml.load(raw) as Record<string, unknown>;
        configs.push({
          filename: file,
          site_name: parsed.site_name ?? file.replace(/\.ya?ml$/, ''),
          base_url: parsed.base_url ?? null,
          start_urls: parsed.start_urls ?? [],
          engine: parsed.engine ?? 'http',
          strategy: (parsed.crawl_strategy as Record<string, unknown>)?.type ?? parsed.strategy ?? 'sitemap',
          requests_per_minute: parsed.requests_per_minute ?? 30,
          timeout_seconds: parsed.timeout_seconds ?? 30,
          raw_yaml: raw,
        });
      } catch {
        // skip invalid YAML
      }
    }
  } catch {
    // configs dir missing
  }
  return NextResponse.json({ configs });
}
