'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Server, Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SiteConfig } from '@/lib/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Props {
  config: SiteConfig;
}

const ENGINE_COLORS: Record<string, 'accent' | 'warning' | 'default'> = {
  http: 'accent',
  playwright: 'warning',
};

const STRATEGY_COLORS: Record<string, 'success' | 'default' | 'muted'> = {
  sitemap: 'success',
  pagination: 'default',
  rss: 'muted',
  search: 'muted',
};

export function ConfigViewer({ config }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary */}
      <div className="glass p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{String(config.site_name)}</h2>
            {config.base_url && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{String(config.base_url)}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={ENGINE_COLORS[String(config.engine)] ?? 'default'}>
              {String(config.engine)}
            </Badge>
            <Badge variant={STRATEGY_COLORS[String(config.strategy)] ?? 'default'}>
              {String(config.strategy)}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>{String(config.requests_per_minute)} req/min</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>{String(config.timeout_seconds)}s timeout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3 w-3 text-cyan-400" />
            <span>{Array.isArray(config.start_urls) ? config.start_urls.length : 0} start URL{Array.isArray(config.start_urls) && config.start_urls.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* YAML Editor (read-only) */}
      <div className="glass overflow-hidden">
        <div className="border-b border-white/[0.06] px-4 py-2.5">
          <p className="font-mono text-xs text-muted-foreground">{config.filename}</p>
        </div>
        <div className="h-[500px]">
          <MonacoEditor
            language="yaml"
            value={config.raw_yaml}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              lineNumbers: 'on',
              folding: true,
              renderLineHighlight: 'none',
              contextmenu: false,
            }}
            theme="vs-dark"
            onMount={(editor, monaco) => {
              monaco.editor.defineTheme('tlusr', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                  { token: 'key.yaml', foreground: '22d3ee' },
                  { token: 'string.yaml', foreground: '34d399' },
                  { token: 'number', foreground: 'f0abfc' },
                  { token: 'comment', foreground: '52525b', fontStyle: 'italic' },
                ],
                colors: {
                  'editor.background': '#09090b',
                  'editor.foreground': '#e4e4e7',
                  'editorLineNumber.foreground': '#3f3f46',
                  'editorCursor.foreground': '#22d3ee',
                  'editor.selectionBackground': '#22d3ee22',
                },
              });
              monaco.editor.setTheme('tlusr');
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
