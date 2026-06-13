'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NODE_BY_ID } from '@/lib/pipeline-nodes';
import type { PipelineNodeId, QueueCounts } from '@/lib/types';

interface Props {
  selectedId: PipelineNodeId | null;
  counts?: Record<string, QueueCounts>;
  onClose: () => void;
}

export function StageDetailsPanel({ selectedId, counts, onClose }: Props) {
  const meta = selectedId ? NODE_BY_ID.get(selectedId) : null;

  return (
    <AnimatePresence>
      {meta && (
        <motion.div
          key={meta.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="glass-strong absolute right-4 top-4 z-20 flex w-72 flex-col"
          style={{ maxHeight: 'calc(100% - 2rem)' }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-zinc-100">{meta.label}</span>
              <Badge variant={meta.role === 'worker' ? 'accent' : meta.role === 'queue' ? 'default' : 'success'}>
                {meta.role}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">{meta.description}</p>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Details
                </p>
                <ul className="space-y-1.5">
                  {meta.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {meta.role === 'queue' && counts && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Queue Stats
                  </p>
                  {(() => {
                    const queueKey = meta.id === 'queue_c2s' ? 'crawler_to_scraper' : 'scraper_to_parser';
                    const c = counts[queueKey];
                    if (!c) return null;
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {(['pending', 'processing', 'done', 'dead'] as const).map((state) => (
                          <div
                            key={state}
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center"
                          >
                            <p className="font-mono text-lg font-bold text-zinc-100">{c[state]}</p>
                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{state}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
