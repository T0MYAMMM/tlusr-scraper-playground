'use client';

import { motion } from 'framer-motion';
import { Database, Layers, Globe2, TrendingUp } from 'lucide-react';
import type { SystemStatus } from '@/lib/types';

interface Props {
  status: SystemStatus;
}

export function SystemMetrics({ status }: Props) {
  const totalCrawled =
    status.queues.crawler_to_scraper.done + status.queues.crawler_to_scraper.pending;
  const totalScraped =
    status.queues.scraper_to_parser.done + status.queues.scraper_to_parser.pending;
  const parseRate =
    totalScraped > 0 ? Math.round((status.total_articles / totalScraped) * 100) : 0;

  const metrics = [
    {
      icon: Globe2,
      label: 'URLs Discovered',
      value: totalCrawled.toLocaleString(),
      color: 'text-cyan-300',
      bg: 'bg-cyan-400/10 border-cyan-400/20',
    },
    {
      icon: Database,
      label: 'Pages Scraped',
      value: totalScraped.toLocaleString(),
      color: 'text-sky-300',
      bg: 'bg-sky-400/10 border-sky-400/20',
    },
    {
      icon: Layers,
      label: 'Articles Parsed',
      value: status.total_articles.toLocaleString(),
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      icon: TrendingUp,
      label: 'Parse Rate',
      value: `${parseRate}%`,
      color: 'text-violet-300',
      bg: 'bg-violet-400/10 border-violet-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map(({ icon: Icon, label, value, color, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 28 }}
          className={`flex flex-col gap-2 rounded-xl border p-4 ${bg}`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <div>
            <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
