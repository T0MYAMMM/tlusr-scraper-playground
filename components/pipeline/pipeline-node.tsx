'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PipelineNodeMeta, QueueCounts } from '@/lib/types';

type NodeData = {
  meta: PipelineNodeMeta;
  counts?: QueueCounts;
  selected?: boolean;
  index: number;
};

const TIER_STYLES: Record<string, { border: string; bg: string; badge: string; glow: string }> = {
  crawl: {
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/5',
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/25',
    glow: 'shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]',
  },
  queue: {
    border: 'border-zinc-500/30',
    bg: 'bg-zinc-500/5',
    badge: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25',
    glow: 'shadow-[0_0_24px_-8px_rgba(113,113,122,0.3)]',
  },
  scrape: {
    border: 'border-sky-400/30',
    bg: 'bg-sky-400/5',
    badge: 'bg-sky-400/15 text-sky-300 border-sky-400/25',
    glow: 'shadow-[0_0_24px_-8px_rgba(56,189,248,0.4)]',
  },
  parse: {
    border: 'border-violet-400/30',
    bg: 'bg-violet-400/5',
    badge: 'bg-violet-400/15 text-violet-300 border-violet-400/25',
    glow: 'shadow-[0_0_24px_-8px_rgba(167,139,250,0.4)]',
  },
  output: {
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/5',
    badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25',
    glow: 'shadow-[0_0_24px_-8px_rgba(52,211,153,0.4)]',
  },
};

export const PipelineNode = memo(function PipelineNode({ data, selected }: NodeProps) {
  const { meta, counts, index } = data as NodeData;
  const styles = TIER_STYLES[meta.tier] ?? TIER_STYLES.queue;
  const isQueue = meta.role === 'queue';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index as number) * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'relative w-52 rounded-xl border backdrop-blur-xl transition-all duration-200',
        'bg-zinc-950/80 px-4 py-3',
        styles.border,
        styles.bg,
        selected && [styles.glow, 'ring-1 ring-white/[0.12]'],
      )}
    >
      {meta.role !== 'output' && (
        <Handle type="source" position={Position.Right} className="!right-[-5px]" />
      )}
      {meta.id !== 'crawler' && (
        <Handle type="target" position={Position.Left} className="!left-[-5px]" />
      )}

      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider',
                styles.badge,
              )}
            >
              {meta.tier}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-zinc-100">{meta.label}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground line-clamp-2">
            {meta.description}
          </p>
        </div>
      </div>

      {isQueue && counts && (
        <div className="mt-3 grid grid-cols-4 gap-1 border-t border-white/[0.06] pt-3">
          {(['pending', 'processing', 'done', 'dead'] as const).map((state) => (
            <div key={state} className="text-center">
              <p className="font-mono text-sm font-bold text-zinc-100">{counts[state]}</p>
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{state.slice(0, 4)}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});
