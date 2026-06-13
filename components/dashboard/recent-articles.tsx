'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { ArticleListItem } from '@/lib/types';

interface Props {
  articles: ArticleListItem[];
}

export function RecentArticles({ articles }: Props) {
  if (articles.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 py-16 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No articles parsed yet.</p>
        <p className="text-xs text-muted-foreground/60">Run the scraper and parser to populate this feed.</p>
      </div>
    );
  }

  return (
    <div className="glass divide-y divide-white/[0.04]">
      {articles.map((article, i) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
          className="group flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/[0.06] bg-white/[0.02]">
            <Globe className="h-3 w-3 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/articles/${article.id}`}
              className="block truncate text-sm font-medium text-zinc-100 hover:text-cyan-300 transition-colors"
            >
              {article.title ?? <span className="italic text-muted-foreground">Untitled</span>}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="muted">{article.site}</Badge>
              {article.language && (
                <Badge variant="default">{article.language.toUpperCase()}</Badge>
              )}
              {article.confidence != null && (
                <Badge variant={article.confidence >= 0.75 ? 'success' : article.confidence >= 0.5 ? 'warning' : 'destructive'}>
                  {Math.round(article.confidence * 100)}% conf
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground/60">
                {article.content_length > 0 ? `${(article.content_length / 1000).toFixed(1)}k chars` : 'no content'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {article.parsed_at ? formatRelativeTime(article.parsed_at) : '—'}
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-cyan-300 transition-colors" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
