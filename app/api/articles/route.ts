import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import type { ArticleListItem } from '@/lib/types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
const PARSED_DIR = path.join(DATA_DIR, 'parsed');

async function getAllArticleFiles(): Promise<{ date: string; site: string; id: string; filePath: string }[]> {
  const results: { date: string; site: string; id: string; filePath: string }[] = [];
  try {
    const dates = await readdir(PARSED_DIR);
    for (const date of dates.sort().reverse()) {
      const datePath = path.join(PARSED_DIR, date);
      const ds = await stat(datePath);
      if (!ds.isDirectory()) continue;
      const sites = await readdir(datePath);
      for (const site of sites.sort()) {
        const sitePath = path.join(datePath, site);
        const ss = await stat(sitePath);
        if (!ss.isDirectory()) continue;
        const files = await readdir(sitePath);
        for (const file of files.filter((f) => f.endsWith('.json'))) {
          results.push({ date, site, id: file.replace('.json', ''), filePath: path.join(sitePath, file) });
        }
      }
    }
  } catch {
    // dir may not exist
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const site = searchParams.get('site') ?? '';

  const allFiles = await getAllArticleFiles();

  // Build list items by reading each file (parse summary fields only)
  const items: ArticleListItem[] = [];
  for (const { date, site: fileSite, id, filePath } of allFiles) {
    if (site && fileSite !== site) continue;
    try {
      const raw = await readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const article = data.article ?? {};
      const diagnostics = data.diagnostics ?? null;

      const title = article.title ?? null;
      const url = article.url ?? '';
      if (q && !title?.toLowerCase().includes(q) && !url.toLowerCase().includes(q)) continue;

      items.push({
        id,
        site: fileSite,
        date,
        title,
        url,
        author: article.author ?? null,
        language: article.language ?? null,
        content_length: (article.content ?? '').length,
        confidence: diagnostics?.aggregate_confidence ?? null,
        parsed_at: article.parsed_at ?? '',
      });
    } catch {
      // skip corrupt files
    }
  }

  const total = items.length;
  const offset = (page - 1) * limit;
  const pageItems = items.slice(offset, offset + limit);

  return NextResponse.json({ articles: pageItems, total, page, limit });
}
