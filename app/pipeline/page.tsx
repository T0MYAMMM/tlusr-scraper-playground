import type { Metadata } from 'next';
import { Workflow } from 'lucide-react';
import { PipelineVisualizer } from '@/components/pipeline/pipeline-visualizer';
import { getSystemStatus } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Pipeline' };
export const revalidate = 10;

export default async function PipelinePage() {
  const status = await getSystemStatus();

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8" style={{ height: 'calc(100vh - 120px)' }}>
      <div>
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold gradient-text">Pipeline Visualizer</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive graph of the Crawler → Scraper → Parser data flow · Click any node to inspect
        </p>
      </div>
      <div className="glass flex-1 overflow-hidden p-1">
        <PipelineVisualizer status={status} />
      </div>
    </div>
  );
}
