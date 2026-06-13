import type { Metadata } from 'next';
import { Radio, RefreshCw } from 'lucide-react';
import { QueueStatsCard } from '@/components/dashboard/queue-stats';
import { SystemMetrics } from '@/components/dashboard/system-metrics';
import { RecentArticles } from '@/components/dashboard/recent-articles';
import { getSystemStatus, getRecentArticles } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Dashboard' };
export const revalidate = 10;

export default async function DashboardPage() {
  const [status, articles] = await Promise.all([getSystemStatus(), getRecentArticles(15)]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            <h1 className="text-2xl font-bold gradient-text">Pipeline Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Crawler → Scraper → Parser · Real-time queue monitoring
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>Refreshes every 10s</span>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Overview</h2>
        <SystemMetrics status={status} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Queue Status</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <QueueStatsCard
            name="crawler_to_scraper"
            label="Crawler → Scraper"
            counts={status.queues.crawler_to_scraper}
            index={0}
          />
          <QueueStatsCard
            name="scraper_to_parser"
            label="Scraper → Parser"
            counts={status.queues.scraper_to_parser}
            index={1}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recent Parsed Articles</h2>
          <a href="/articles" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            View all →
          </a>
        </div>
        <RecentArticles articles={articles} />
      </section>
    </div>
  );
}
