import type { Point, Polygon } from '../types/geometry';

export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function angle(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** Shoelace formula — returns area in square world-units (metres²) */
export function polygonArea(vertices: Point[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/** Perimeter of a closed polygon */
export function polygonPerimeter(vertices: Point[]): number {
  if (vertices.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    perimeter += distance(vertices[i], vertices[j]);
  }
  return perimeter;
}

/** Point-in-polygon test (ray casting) */
export function pointInPolygon(point: Point, vertices: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Get edges as pairs of consecutive vertices */
export function getEdges(polygon: Polygon): [Point, Point][] {
  const { vertices, isClosed } = polygon;
  const edges: [Point, Point][] = [];
  const len = isClosed ? vertices.length : vertices.length - 1;
  for (let i = 0; i < len; i++) {
    edges.push([vertices[i], vertices[(i + 1) % vertices.length]]);
  }
  return edges;
}

/** Distance from a point to a line segment */
export function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
