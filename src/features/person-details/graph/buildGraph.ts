import type { PersonGraphData } from '../usePersonGraphData';
import type { Node, Edge } from 'reactflow';

/**
 * Build React Flow graph for a person:
 * person → films → (optional) starships used by that person in each film.
 * Films are always connected; films with no starships get a dashed style.
 */
export function buildGraph(data: PersonGraphData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Person node (root)
  nodes.push({
    id: `person-${data.person.id}`,
    type: 'default',
    data: { label: data.person.name },
    // Layout engine will reposition these; initial (0,0) is a placeholder
    position: { x: 0, y: 0 },
    style: {
      padding: 8,
      borderRadius: 8,
      fontWeight: 600,
      backgroundColor: '#1a1a1a',
      color: 'white',
    },
  });

  for (const f of data.films) {
    // Film node (always present). Dashed border if no starships for this person in this film.
    nodes.push({
      id: `film-${f.id}`,
      type: 'default',
      data: { label: f.title },
      position: { x: 0, y: 0 },
      style: {
        padding: 8,
        borderRadius: 8,
        borderStyle: f.starships.length === 0 ? 'dashed' : 'solid',
        backgroundColor: f.starships.length === 0 ? '#fff3cd' : '#e0f7fa',
        fontWeight: 500,
      },
    });

    // Always link person → film (even if the film has zero starships)
    edges.push({
      id: `e-person-${data.person.id}-film-${f.id}`,
      source: `person-${data.person.id}`,
      target: `film-${f.id}`,
      animated: false,
    });

    // Optional starship nodes (only if the person used starships in this film)
    for (const s of f.starships) {
      const shipNodeId = `ship-${s.id}-f${f.id}`;

      nodes.push({
        id: shipNodeId,
        type: 'default',
        data: { label: s.name },
        position: { x: 0, y: 0 },
        style: {
          padding: 6,
          borderRadius: 8,
          fontSize: 12,
          opacity: 0.95,
          backgroundColor: '#f1f8e9',
        },
      });

      // film → starship edge
      edges.push({
        id: `e-film-${f.id}-ship-${s.id}`,
        source: `film-${f.id}`,
        target: shipNodeId,
      });
    }
  }

  return { nodes, edges };
}
