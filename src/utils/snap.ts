import type { Point } from '../types/geometry';
import { GRID_MAJOR_SPACING, SNAP_THRESHOLD_WORLD } from '../constants';

/** Snap a world-space point to the nearest grid intersection if within threshold */
export function snapToGrid(p: Point, threshold = SNAP_THRESHOLD_WORLD): Point {
  const spacing = GRID_MAJOR_SPACING;
  const snappedX = Math.round(p.x / spacing) * spacing;
  const snappedY = Math.round(p.y / spacing) * spacing;

  const dx = Math.abs(p.x - snappedX);
  const dy = Math.abs(p.y - snappedY);

  return {
    x: dx < threshold ? snappedX : p.x,
    y: dy < threshold ? snappedY : p.y,
  };
}
