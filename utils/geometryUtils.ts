// src/utils/geometryUtils.ts
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
