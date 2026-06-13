'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode2, Globe, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfigViewer } from '@/components/configs/config-viewer';
import { cn } from '@/lib/utils';
import type { SiteConfig } from '@/lib/types';

interface Props {
  configs: SiteConfig[];
}

const ENGINE_VARIANT: Record<string, 'accent' | 'warning' | 'default'> = {
  http: 'accent',
  playwright: 'warning',
};

export function ConfigsWorkspace({ configs }: Props) {
  const [selected, setSelected] = useState<SiteConfig | null>(configs[0] ?? null);

  if (configs.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 py-20 text-center">
        <FileCode2 className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No config files found in configs/</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-1.5">
        {configs.map((config, i) => (
          <motion.button
            key={config.filename}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
            onClick={() => setSelected(config)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left transition-all',
              selected?.filename === config.filename
                ? 'border-cyan-400/30 bg-cyan-400/5 shadow-[0_0_16px_-6px_rgba(34,211,238,0.3)]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04]',
            )}
          >
            <p className="text-sm font-medium text-zinc-100">{String(config.site_name)}</p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
              {config.filename}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant={ENGINE_VARIANT[String(config.engine)] ?? 'default'} className="text-[9px]">
                {String(config.engine)}
              </Badge>
              <Badge variant="muted" className="text-[9px]">
                {String(config.strategy)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" />
                {String(config.requests_per_minute)} rpm
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" />
                {Array.isArray(config.start_urls) ? config.start_urls.length : 0} URLs
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Config detail */}
      <div className="min-w-0 flex-1">
        {selected ? (
          <ConfigViewer config={selected} />
        ) : (
          <div className="glass flex items-center justify-center py-20 text-sm text-muted-foreground">
            Select a config to inspect
          </div>
        )}
      </div>
    </div>
  );
}
