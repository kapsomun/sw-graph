import ELK from 'elkjs';
import type { ElkNode } from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge, XYPosition } from 'reactflow';

const elk = new ELK();

type LayoutOptions = {
  nodeWidth?: number;
  nodeHeight?: number;
  spacing?: number;
};

/**
 * Run an automatic layered layout (top → bottom) using ELK and
 * return React Flow nodes with computed positions.
 *
 * - Uses the "layered" algorithm well-suited for DAG-like graphs.
 * - Keeps visual spacing configurable via `spacing`.
 * - Treats every RF node as a fixed box (width/height) to help ELK compute coordinates.
 *
 * @param nodes React Flow nodes (positions will be overwritten)
 * @param edges React Flow edges
 * @param opts  Basic layout options (node box size + spacing)
 * @returns { nodes, edges } with updated node positions
 */
export async function layoutWithElk(
  nodes: Node[],
  edges: Edge[],
  opts: LayoutOptions = {}
) {
  const { nodeWidth = 160, nodeHeight = 48, spacing = 48 } = opts;

  // Build an ELK graph model from React Flow nodes/edges
  const elkNodes: ElkNode = {
    id: 'root',
    layoutOptions: {
      // Main algorithm and direction
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',

      // Spacing knobs
      'elk.spacing.nodeNode': String(spacing),
      'elk.spacing.edgeNode': String(spacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(spacing),

      // Slightly better crossings with semi-interactive mode
      'elk.layered.crossingMinimization.semiInteractive': 'true',
    },

    // Each RF node is represented as a fixed-size child for ELK
    children: nodes.map((n) => ({
      id: n.id,
      width: nodeWidth,
      height: nodeHeight,
    })),

    // ELK edges reference node ids as sources/targets
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  // Compute layout (async)
  const res = await elk.layout(elkNodes);

  // Map ELK coordinates back to React Flow node positions
  const positions = new Map<string, XYPosition>();
  res.children?.forEach((c) => {
    positions.set(c.id, { x: c.x ?? 0, y: c.y ?? 0 });
  });

  const laidOutNodes = nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) ?? n.position, // fallback to existing position
  }));

  return { nodes: laidOutNodes, edges };
}
