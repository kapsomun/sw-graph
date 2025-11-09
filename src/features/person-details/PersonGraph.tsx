import { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import type { FitViewOptions } from 'reactflow';
import 'reactflow/dist/style.css';

import type { PersonGraphData } from './usePersonGraphData';
import { buildGraph } from './graph/buildGraph';
import { layoutWithElk } from './graph/layout';

// Stable options for initial viewport fitting
const fitView: FitViewOptions = { padding: 0.2, includeHiddenNodes: true };

export function PersonGraph({ data }: { data: PersonGraphData }) {
  // Build raw RF nodes/edges from domain data.
  // Memoized to avoid rebuilding unless the input data changes.
  const initial = useMemo(() => buildGraph(data), [data]);

  // React Flow state helpers to track and update nodes/edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // Simple flag to render a layout overlay while ELK is computing
  const [ready, setReady] = useState(false);

  // Recompute layout with ELK whenever the graph (initial) changes.
  // We keep node/edge IDs stable so ELK positions can be mapped back reliably.
  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const run = async () => {
      const { nodes: laidOut } = await layoutWithElk(initial.nodes, initial.edges, {
        nodeWidth: 200,
        nodeHeight: 48,
        spacing: 64,
      });

      if (cancelled) return;
      setNodes(laidOut);
      setEdges(initial.edges);
      setReady(true);
    };

    run();
    return () => {
      cancelled = true; // guard against setState after unmount
    };
    // We intentionally depend only on `initial`, which already includes data deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    // Important: make this container `relative` so the loading overlay can anchor correctly.
    <div style={{ height: 520 }} className="relative border rounded-md overflow-hidden z-2">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={fitView}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        {/* Subtle grid background */}
        <Background />

        {/* Mini-map for quick navigation on larger graphs */}
        <MiniMap pannable zoomable />

        {/* Zoom/pan controls (interaction toggled off to keep graph static) */}
        <Controls showInteractive={false} />

        {/* Layout overlay to avoid flashing unpositioned nodes */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm opacity-80 bg-black/20 backdrop-blur-[1px]">
            Laying out…
          </div>
        )}
      </ReactFlow>
    </div>
  );
}
