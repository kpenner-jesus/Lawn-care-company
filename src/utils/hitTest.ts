import type { Point, Polygon } from '../types/geometry';
import type { Viewport } from './transform';
import { worldToScreen } from './transform';
import { distance, midpoint } from './geometry';
import { VERTEX_HIT_RADIUS, EDGE_MIDPOINT_HIT_RADIUS } from '../constants';

export interface VertexHit {
  type: 'vertex';
  polygonId: string;
  vertexIndex: number;
}

export interface EdgeMidpointHit {
  type: 'edge-midpoint';
  polygonId: string;
  edgeIndex: number;
  point: Point; // world-space midpoint
}

export type HitResult = VertexHit | EdgeMidpointHit | null;

export function hitTestPolygons(
  screenPoint: Point,
  polygons: Polygon[],
  viewport: Viewport
): HitResult {
  // Check vertices first (higher priority)
  for (const polygon of polygons) {
    for (let i = 0; i < polygon.vertices.length; i++) {
      const screenVertex = worldToScreen(polygon.vertices[i], viewport);
      if (distance(screenPoint, screenVertex) <= VERTEX_HIT_RADIUS) {
        return { type: 'vertex', polygonId: polygon.id, vertexIndex: i };
      }
    }
  }

  // Check edge midpoints
  for (const polygon of polygons) {
    if (!polygon.isClosed) continue;
    const verts = polygon.vertices;
    for (let i = 0; i < verts.length; i++) {
      const j = (i + 1) % verts.length;
      const mid = midpoint(verts[i], verts[j]);
      const screenMid = worldToScreen(mid, viewport);
      if (distance(screenPoint, screenMid) <= EDGE_MIDPOINT_HIT_RADIUS) {
        return { type: 'edge-midpoint', polygonId: polygon.id, edgeIndex: i, point: mid };
      }
    }
  }

  return null;
}
