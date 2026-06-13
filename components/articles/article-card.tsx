'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, User, Clock, AlignLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { ArticleListItem } from '@/lib/types';

interface Props {
  article: ArticleListItem;
  index: number;
}

export function ArticleCard({ article, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      className="glass group p-4 hover:border-white/[0.10] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/articles/${article.id}`}
            className="block font-medium text-zinc-100 hover:text-cyan-300 transition-colors line-clamp-2 text-sm leading-snug"
          >
            {article.title ?? <span className="italic text-muted-foreground">Untitled</span>}
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="muted">{article.site}</Badge>
            {article.language && <Badge variant="default">{article.language.toUpperCase()}</Badge>}
            {article.confidence != null && (
              <Badge
                variant={
                  article.confidence >= 0.75 ? 'success' : article.confidence >= 0.5 ? 'warning' : 'destructive'
                }
              >
                {Math.round(article.confidence * 100)}%
              </Badge>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-2.5 w-2.5" />
                {article.author}
              </span>
            )}
            {article.content_length > 0 && (
              <span className="flex items-center gap-1">
                <AlignLeft className="h-2.5 w-2.5" />
                {(article.content_length / 1000).toFixed(1)}k chars
              </span>
            )}
            {article.parsed_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatRelativeTime(article.parsed_at)}
              </span>
            )}
          </div>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-cyan-300 transition-colors" />
        </a>
      </div>
    </motion.div>
  );
}
