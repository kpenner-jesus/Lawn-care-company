import type { Point } from '../types/geometry';

export interface Viewport {
  offsetX: number;
  offsetY: number;
  scale: number; // pixels per metre
}

export function worldToScreen(p: Point, vp: Viewport): Point {
  return {
    x: p.x * vp.scale + vp.offsetX,
    y: p.y * vp.scale + vp.offsetY,
  };
}

export function screenToWorld(p: Point, vp: Viewport): Point {
  return {
    x: (p.x - vp.offsetX) / vp.scale,
    y: (p.y - vp.offsetY) / vp.scale,
  };
}

/** Zoom toward a screen-space anchor point */
export function zoomAtPoint(
  vp: Viewport,
  anchor: Point,
  newScale: number
): Viewport {
  const worldAnchor = screenToWorld(anchor, vp);
  return {
    scale: newScale,
    offsetX: anchor.x - worldAnchor.x * newScale,
    offsetY: anchor.y - worldAnchor.y * newScale,
  };
}
