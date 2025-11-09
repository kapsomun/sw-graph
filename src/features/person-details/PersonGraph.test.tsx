/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Local types (no any) ----
type RFPos = { x: number; y: number };
type RFNode = { id: string; position?: RFPos; data?: unknown };
type RFEdge = { id: string; source: string; target: string };

// ---- MOCKS ----
vi.mock('reactflow', async () => {
  const React = await import('react');

  function useNodesState(initial: RFNode[]) {
    const [nodes, setNodes] = React.useState<RFNode[]>(initial);
    const onNodesChange = vi.fn();
    return [nodes, setNodes, onNodesChange] as const;
  }
  function useEdgesState(initial: RFEdge[]) {
    const [edges, setEdges] = React.useState<RFEdge[]>(initial);
    const onEdgesChange = vi.fn();
    return [edges, setEdges, onEdgesChange] as const;
  }

  type RFProps = {
    nodes?: RFNode[];
    edges?: RFEdge[];
    children?: React.ReactNode;
  };

  const ReactFlow = (props: RFProps) => {
    const positions = (props.nodes ?? []).map((n) => n.position ?? { x: 0, y: 0 });
    return (
      <div data-testid="reactflow">
        <div data-testid="rf-nodes-count">{props.nodes?.length ?? 0}</div>
        <div data-testid="rf-edges-count">{props.edges?.length ?? 0}</div>
        <div data-testid="rf-node-positions">{JSON.stringify(positions)}</div>
        {props.children}
      </div>
    );
  };

  const Background = () => <div data-testid="rf-bg" />;
  const MiniMap = () => <div data-testid="rf-minimap" />;
  const Controls = () => <div data-testid="rf-controls" />;

  return {
    default: ReactFlow,
    Background,
    MiniMap,
    Controls,
    useNodesState,
    useEdgesState,
  };
});

// buildGraph — stable ids
vi.mock('./graph/buildGraph', () => ({
  buildGraph: vi.fn(
    (data: { person: { id: number; name: string }; films: Array<{ id: number; title: string }> }) => {
      const nodes: RFNode[] = [
        { id: `p-${data.person.id}`, position: { x: 0, y: 0 }, data: { label: data.person.name } },
        ...data.films.map((f) => ({
          id: `f-${f.id}`,
          position: { x: 0, y: 0 },
          data: { label: f.title },
        })),
      ];
      const edges: RFEdge[] = data.films.map((f) => ({
        id: `e-${data.person.id}-${f.id}`,
        source: `p-${data.person.id}`,
        target: `f-${f.id}`,
      }));
      return { nodes, edges };
    }
  ),
}));

// layoutWithElk — async via setTimeout(0), no fake timers
const layoutWithElkSpy = vi.fn();
vi.mock('./graph/layout', () => ({
  layoutWithElk: (...args: unknown[]) => layoutWithElkSpy(...args),
}));

import { PersonGraph } from './PersonGraph';
import type { PersonGraphData } from './usePersonGraphData';

describe('PersonGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    layoutWithElkSpy.mockImplementation((nodes: RFNode[], edges: RFEdge[]) => {
      return new Promise<{ nodes: RFNode[]; edges: RFEdge[] }>((resolve) => {
        setTimeout(() => {
          const laid: RFNode[] = nodes.map((n, i) => ({
            ...n,
            position: { x: i * 10, y: i * 5 },
          }));
          resolve({ nodes: laid, edges });
        }, 0);
      });
    });
  });

  const data: PersonGraphData = {
    person: { id: 1, name: 'Luke' },
    films: [
      { id: 10, title: 'A New Hope', starships: [] },
      { id: 20, title: 'The Empire Strikes Back', starships: [] },
    ],
  };

  it('shows/hides the "Laying out…" overlay during async layout', async () => {
    render(<PersonGraph data={data} />);

    // overlay appears immediately
    expect(screen.getByText(/Laying out/i)).toBeInTheDocument();

    // and disappears after layout finishes
    await waitFor(() => {
      expect(screen.queryByText(/Laying out/i)).not.toBeInTheDocument();
    });
  });

  it('calls layoutWithElk with correct arguments', async () => {
    render(<PersonGraph data={data} />);

    await waitFor(() => {
      expect(layoutWithElkSpy).toHaveBeenCalledTimes(1);
    });

    const [nodesArg, edgesArg, optionsArg] = layoutWithElkSpy.mock.calls[0] as [
      RFNode[],
      RFEdge[],
      { nodeWidth: number; nodeHeight: number; spacing: number }
    ];
    expect(nodesArg).toHaveLength(3);
    expect(edgesArg).toHaveLength(2);
    expect(optionsArg).toMatchObject({ nodeWidth: 200, nodeHeight: 48, spacing: 64 });
  });

  it('passes nodes/edges to ReactFlow and updates positions after layout', async () => {
    render(<PersonGraph data={data} />);

    // base structure immediately
    expect(screen.getByTestId('reactflow')).toBeInTheDocument();
    expect(screen.getByTestId('rf-nodes-count')).toHaveTextContent('3');
    expect(screen.getByTestId('rf-edges-count')).toHaveTextContent('2');

    // positions updated after layout
    await waitFor(() => {
      const raw = screen.getByTestId('rf-node-positions').textContent ?? '[]';
      const positions: RFPos[] = JSON.parse(raw);
      expect(positions).toHaveLength(3);
      expect(positions[1]).toEqual({ x: 10, y: 5 });
    });
  });

  it('renders Background, MiniMap, Controls', () => {
    render(<PersonGraph data={data} />);
    expect(screen.getByTestId('rf-bg')).toBeInTheDocument();
    expect(screen.getByTestId('rf-minimap')).toBeInTheDocument();
    expect(screen.getByTestId('rf-controls')).toBeInTheDocument();
  });
});
