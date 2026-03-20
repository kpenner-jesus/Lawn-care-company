import type { BundleSize } from './types/settings';

export const DEFAULT_BUNDLE_SIZE: BundleSize = {
  id: 'default-1x1',
  name: '1m × 1m',
  width: 1,
  height: 1,
  isDefault: true,
};

export const DEFAULT_OVERAGE = 10; // percent

export const GRID_MINOR_SPACING = 0.25; // metres
export const GRID_MAJOR_SPACING = 1;    // metres

export const SNAP_THRESHOLD_WORLD = 0.15; // metres — grid snap distance

export const VERTEX_HANDLE_RADIUS = 14;       // pixels (screen space)
export const VERTEX_HIT_RADIUS = 24;          // pixels — touch target
export const EDGE_MIDPOINT_HIT_RADIUS = 18;   // pixels

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const DEFAULT_SCALE = 40; // pixels per metre

export const HISTORY_LIMIT = 50;

export const M_TO_FT = 3.28084;
export const SQM_TO_SQFT = 10.7639;
