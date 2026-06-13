'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PipelineNode } from './pipeline-node';
import { StageDetailsPanel } from './stage-details-panel';
import { PIPELINE_NODES } from '@/lib/pipeline-nodes';
import type { PipelineNodeId, SystemStatus } from '@/lib/types';

const NODE_TYPES = { pipeline: PipelineNode };

function buildGraph(status: SystemStatus | null) {
  const counts = status?.queues ?? {};
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Layout: 3 rows, workers and queues interleaved
  // Row positions: crawler(0), queue_c2s(1), scraper(2), queue_s2p(3), parser(4), output(5)
  const xPositions: Record<string, number> = {
    crawler: 0,
    queue_c2s: 240,
    scraper: 520,
    queue_s2p: 760,
    parser: 1040,
    output: 1300,
  };

  PIPELINE_NODES.forEach((meta, index) => {
    const queueKey = meta.id === 'queue_c2s' ? 'crawler_to_scraper' : meta.id === 'queue_s2p' ? 'scraper_to_parser' : undefined;
    nodes.push({
      id: meta.id,
      type: 'pipeline',
      position: { x: xPositions[meta.id] ?? index * 240, y: 80 },
      data: {
        meta,
        counts: queueKey ? counts[queueKey as keyof typeof counts] : undefined,
        index,
      },
    });
  });

  const edgePairs: [string, string][] = [
    ['crawler', 'queue_c2s'],
    ['queue_c2s', 'scraper'],
    ['scraper', 'queue_s2p'],
    ['queue_s2p', 'parser'],
    ['parser', 'output'],
  ];

  edgePairs.forEach(([source, target], i) => {
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(187 92% 48% / 0.4)', strokeWidth: 2 },
    });
  });

  return { nodes, edges };
}

interface Props {
  status: SystemStatus | null;
}

export function PipelineVisualizer({ status }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = buildGraph(status);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<PipelineNodeId | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId((prev) => (prev === node.id ? null : (node.id as PipelineNodeId)));
  }, []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={1.8}
        className="rounded-xl"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="rgba(255,255,255,0.04)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const tier = (node.data as { meta: { tier: string } }).meta?.tier;
            const colors: Record<string, string> = {
              crawl: '#22d3ee',
              queue: '#71717a',
              scrape: '#38bdf8',
              parse: '#a78bfa',
              output: '#34d399',
            };
            return colors[tier] ?? '#71717a';
          }}
          maskColor="rgba(10,10,12,0.7)"
          style={{ background: 'rgba(10,10,12,0.6)', border: '1px solid hsl(240 6% 16%)' }}
        />
      </ReactFlow>

      <StageDetailsPanel
        selectedId={selectedId}
        counts={status?.queues as Record<string, import('@/lib/types').QueueCounts>}
        onClose={() => setSelectedId(null)}
      />

      {!selectedId && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.06] bg-zinc-950/60 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur">
          Click any node to inspect · Drag to rearrange
        </p>
      )}
    </div>
  );
}
