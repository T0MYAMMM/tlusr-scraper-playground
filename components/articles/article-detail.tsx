'use client';

import { motion } from 'framer-motion';
import { ExternalLink, User, Calendar, Globe, Tag, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatMs } from '@/lib/utils';
import type { ArticleFile } from '@/lib/types';

interface Props {
  data: ArticleFile;
}

export function ArticleDetail({ data }: Props) {
  const { article, diagnostics } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="glass p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{data.site}</Badge>
          {article.language && <Badge variant="default">{article.language.toUpperCase()}</Badge>}
          {diagnostics?.aggregate_confidence != null && (
            <Badge
              variant={
                diagnostics.aggregate_confidence >= 0.75
                  ? 'success'
                  : diagnostics.aggregate_confidence >= 0.5
                  ? 'warning'
                  : 'destructive'
              }
            >
              {Math.round(diagnostics.aggregate_confidence * 100)}% confidence
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-xl font-bold leading-tight text-zinc-100">
          {article.title ?? <span className="italic text-muted-foreground">Untitled</span>}
        </h1>

        {article.subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{article.subtitle}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {article.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
          {article.publish_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(article.publish_date).toLocaleDateString()}
            </span>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <Globe className="h-3 w-3" />
            {article.source_domain}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="glass p-6">
            {article.summary && (
              <blockquote className="mb-4 border-l-2 border-cyan-400/50 pl-4 text-sm italic text-zinc-300">
                {article.summary}
              </blockquote>
            )}
            {article.content ? (
              <div className="space-y-3 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                {article.content}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No content extracted.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metadata">
          <div className="glass divide-y divide-white/[0.04]">
            {[
              { label: 'URL', value: article.url },
              { label: 'Canonical URL', value: article.canonical_url },
              { label: 'Source Domain', value: article.source_domain },
              { label: 'Author', value: article.author },
              { label: 'Authors', value: article.authors?.join(', ') },
              { label: 'Publish Date', value: article.publish_date },
              { label: 'Updated Date', value: article.updated_date },
              { label: 'Language', value: article.language },
              { label: 'Categories', value: article.categories?.join(', ') },
              { label: 'Tags', value: article.tags?.join(', ') },
              { label: 'Crawl Timestamp', value: article.crawl_timestamp },
              { label: 'Parsed At', value: article.parsed_at },
            ]
              .filter(({ value }) => value)
              .map(({ label, value }) => (
                <div key={label} className="flex gap-4 px-5 py-3 text-xs">
                  <span className="w-28 shrink-0 font-medium text-muted-foreground">{label}</span>
                  <span className="text-zinc-200 break-all">{value}</span>
                </div>
              ))}

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-5 py-3">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <Tag className="h-2 w-2" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          {diagnostics ? (
            <div className="space-y-3">
              <div className="glass p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Confidence', value: diagnostics.aggregate_confidence != null ? `${Math.round(diagnostics.aggregate_confidence * 100)}%` : '—' },
                    { label: 'Distiller', value: diagnostics.distiller_used ?? '—' },
                    { label: 'LLM Calls', value: String(diagnostics.llm_calls ?? 0) },
                    { label: 'LLM Tokens', value: String(diagnostics.llm_tokens ?? 0) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <p className="font-mono text-base font-bold text-zinc-100">{value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {diagnostics.timings_ms && Object.keys(diagnostics.timings_ms).length > 0 && (
                <div className="glass p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Activity className="h-3 w-3" />
                    Stage Timings
                  </p>
                  <div className="space-y-2">
                    {Object.entries(diagnostics.timings_ms).map(([stage, ms]) => (
                      <div key={stage} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">{stage}</span>
                        <span className="font-mono text-zinc-300">{formatMs(ms as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diagnostics.notes && diagnostics.notes.length > 0 && (
                <div className="glass p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</p>
                  <ul className="space-y-1">
                    {diagnostics.notes.map((note, i) => (
                      <li key={i} className="text-xs text-muted-foreground">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-8 text-center text-sm text-muted-foreground">
              No diagnostics available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="json">
          <ScrollArea className="h-[500px] rounded-xl">
            <pre className="glass p-5 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify({ article, diagnostics }, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
