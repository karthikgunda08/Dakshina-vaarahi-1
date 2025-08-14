// src/lib/geometryUtils.ts
import type { Wall } from '../types/index';

interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the area of a polygon defined by a set of walls using the Shoelace formula.
 * It automatically finds unique vertices and sorts them to handle complex room shapes.
 * @param walls - An array of Wall objects that form the boundary of the room.
 * @returns The calculated area of the room.
 */
export const calculateRoomArea = (walls: Wall[]): number => {
  if (!walls || walls.length < 3) return 0;

  // Extract all unique vertices from the walls
  const points: Point[] = [];
  walls.forEach(w => {
    points.push({ x: w.x1, y: w.y1 });
    points.push({ x: w.x2, y: w.y2 });
  });
  const uniqueVertices = Array.from(new Map(points.map(p => [`${p.x},${p.y}`, p])).values());

  if (uniqueVertices.length < 3) return 0;

  // Find the centroid of the vertices to sort them
  const center = uniqueVertices.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  center.x /= uniqueVertices.length;
  center.y /= uniqueVertices.length;

  // Sort vertices by angle from the centroid
  uniqueVertices.sort((a, b) => 
    Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x)
  );

  // Apply the Shoelace formula
  let area = 0;
  for (let i = 0; i < uniqueVertices.length; i++) {
    const j = (i + 1) % uniqueVertices.length;
    area += uniqueVertices[i].x * uniqueVertices[j].y;
    area -= uniqueVertices[j].x * uniqueVertices[i].y;
  }
  return Math.abs(area / 2);
};


/**
 * NEW: Detects closed loops of walls and creates Room objects.
 * This function builds a graph from the walls and finds all elementary cycles.
 */
export const detectRooms = (walls: Wall[]): { wallIds: string[] }[] => {
    if (walls.length < 3) return [];

    const pointToString = (p: Point) => `${Math.round(p.x)},${Math.round(p.y)}`;

    const adj: Map<string, string[]> = new Map();
    const wallMap: Map<string, string> = new Map();

    walls.forEach(wall => {
        const p1 = pointToString({ x: wall.x1, y: wall.y1 });
        const p2 = pointToString({ x: wall.x2, y: wall.y2 });

        if (!adj.has(p1)) adj.set(p1, []);
        if (!adj.has(p2)) adj.set(p2, []);
        
        adj.get(p1)!.push(p2);
        adj.get(p2)!.push(p1);

        wallMap.set(`${p1}-${p2}`, wall.id);
        wallMap.set(`${p2}-${p1}`, wall.id);
    });

    const cycles: string[][] = [];
    
    const findNewCycles = (path: string[]) => {
        const startNode = path[0];
        const nextNodes = adj.get(path[path.length - 1])!;

        for (const nextNode of nextNodes) {
            if (path.length > 2 && nextNode === startNode) {
                // Cycle detected
                const sortedCycle = path.slice().sort();
                const cycleId = sortedCycle.join('|');
                if (!cycles.some(c => c.slice().sort().join('|') === cycleId)) {
                    cycles.push([...path]);
                }
                continue;
            }
            if (!path.includes(nextNode)) {
                findNewCycles([...path, nextNode]);
            }
        }
    };

    for (const startNode of adj.keys()) {
        findNewCycles([startNode]);
    }
    
    return cycles.map(cycle => {
        const wallIds: string[] = [];
        for (let i = 0; i < cycle.length; i++) {
            const u = cycle[i];
            const v = cycle[(i + 1) % cycle.length];
            const wallId = wallMap.get(`${u}-${v}`);
            if (wallId) wallIds.push(wallId);
        }
        return { wallIds: Array.from(new Set(wallIds)) };
    });
};
