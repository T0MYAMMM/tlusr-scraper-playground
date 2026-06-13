'use client';

import { motion } from 'framer-motion';
import { Clock, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueueCounts } from '@/lib/types';

interface Props {
  name: string;
  label: string;
  counts: QueueCounts;
  index: number;
}

const STATES = [
  { key: 'pending' as const, label: 'Pending', icon: Clock, color: 'text-amber-300', bg: 'bg-amber-400/10 border-amber-400/20' },
  { key: 'processing' as const, label: 'Processing', icon: Loader2, color: 'text-cyan-300', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { key: 'done' as const, label: 'Done', icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { key: 'dead' as const, label: 'Dead', icon: XCircle, color: 'text-rose-300', bg: 'bg-rose-400/10 border-rose-400/20' },
];

export function QueueStatsCard({ name, label, counts, index }: Props) {
  const total = counts.pending + counts.processing + counts.done + counts.dead;
  const throughput = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 28 }}
      className="glass p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-zinc-100 text-sm">{label}</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{throughput}% done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${throughput}%` }}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATES.map(({ key, label: stateLabel, icon: Icon, color, bg }) => (
          <div
            key={key}
            className={cn('flex flex-col gap-1 rounded-lg border p-2.5', bg)}
          >
            <div className="flex items-center gap-1.5">
              <Icon className={cn('h-3 w-3', color, key === 'processing' && counts.processing > 0 && 'animate-spin')} />
              <span className={cn('text-[10px] font-medium uppercase tracking-wide', color)}>
                {stateLabel}
              </span>
            </div>
            <span className="font-mono text-xl font-semibold text-zinc-100">
              {counts[key].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
