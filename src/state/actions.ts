import type { Point, Polygon, SubtractionZone } from '../types/geometry';
import type { BundleSize, UnitSystem } from '../types/settings';
import type { SavedLawn } from '../types/lawn';
import type { Viewport } from '../utils/transform';

export type Action =
  // Shape placement
  | { type: 'PLACE_SHAPE'; polygon: Polygon }
  | { type: 'CLEAR_SHAPE' }

  // Vertex editing
  | { type: 'MOVE_VERTEX'; polygonId: string; vertexIndex: number; point: Point }
  | { type: 'INSERT_VERTEX'; polygonId: string; edgeIndex: number; point: Point }
  | { type: 'DELETE_VERTEX'; polygonId: string; vertexIndex: number }

  // Subtraction zones
  | { type: 'ADD_SUBTRACTION'; zone: SubtractionZone }
  | { type: 'UPDATE_SUBTRACTION'; zoneId: string; vertices: Point[] }
  | { type: 'DELETE_SUBTRACTION'; zoneId: string }

  // Mode
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_SELECTED'; polygonId: string | null }

  // Viewport
  | { type: 'SET_VIEWPORT'; viewport: Viewport }

  // Settings
  | { type: 'SET_UNIT_SYSTEM'; unitSystem: UnitSystem }
  | { type: 'SET_OVERAGE'; percentage: number }
  | { type: 'SET_ACTIVE_BUNDLE'; bundleSizeId: string }
  | { type: 'ADD_BUNDLE_SIZE'; bundleSize: BundleSize }
  | { type: 'UPDATE_BUNDLE_SIZE'; bundleSize: BundleSize }
  | { type: 'DELETE_BUNDLE_SIZE'; bundleSizeId: string }
  | { type: 'SET_DEFAULT_BUNDLE'; bundleSizeId: string }

  // Saved lawns
  | { type: 'SAVE_LAWN'; lawn: SavedLawn }
  | { type: 'LOAD_LAWN'; lawn: SavedLawn }
  | { type: 'DELETE_LAWN'; lawnId: string }

  // History
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type AppMode = 'select' | 'subtract' | 'place-subtract';
