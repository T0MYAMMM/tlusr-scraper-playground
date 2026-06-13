import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
const PARSED_DIR = path.join(DATA_DIR, 'parsed');

async function findArticleFile(id: string): Promise<string | null> {
  try {
    const dates = await readdir(PARSED_DIR);
    for (const date of dates.sort().reverse()) {
      const datePath = path.join(PARSED_DIR, date);
      const ds = await stat(datePath);
      if (!ds.isDirectory()) continue;
      const sites = await readdir(datePath);
      for (const site of sites) {
        const filePath = path.join(datePath, site, `${id}.json`);
        try {
          await stat(filePath);
          return filePath;
        } catch {
          // not found in this path
        }
      }
    }
  } catch {
    // parsed dir missing
  }
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const filePath = await findArticleFile(id);
  if (!filePath) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }
  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const parts = filePath.split(path.sep);
    const site = parts[parts.length - 2];
    const date = parts[parts.length - 3];
    return NextResponse.json({ id, site, date, ...data });
  } catch {
    return NextResponse.json({ error: 'Failed to read article' }, { status: 500 });
  }
}
