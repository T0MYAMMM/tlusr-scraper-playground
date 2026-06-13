import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { ConfigsWorkspace } from './workspace';
import { getSiteConfigs } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Configs' };
export const revalidate = 60;

export default async function ConfigsPage() {
  const configs = await getSiteConfigs();

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold gradient-text">Site Configs</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          YAML configuration files for each news source
        </p>
      </div>
      <ConfigsWorkspace configs={configs} />
    </div>
  );
}
