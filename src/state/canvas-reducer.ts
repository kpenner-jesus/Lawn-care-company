import type { Polygon, SubtractionZone } from '../types/geometry';
import type { BundleSize, UnitSystem } from '../types/settings';
import type { SavedLawn } from '../types/lawn';
import type { Viewport } from '../utils/transform';
import type { Action, AppMode } from './actions';
import { DEFAULT_BUNDLE_SIZE, DEFAULT_OVERAGE, DEFAULT_SCALE, HISTORY_LIMIT } from '../constants';

export interface CanvasState {
  // Drawing
  mainPolygon: Polygon | null;
  subtractionZones: SubtractionZone[];
  selectedPolygonId: string | null;
  mode: AppMode;

  // Viewport
  viewport: Viewport;

  // Settings
  unitSystem: UnitSystem;
  bundleSizes: BundleSize[];
  activeBundleSizeId: string;
  overage: number;

  // Saved lawns
  savedLawns: SavedLawn[];

  // Undo/redo (stores snapshots of drawing state only)
  history: DrawingSnapshot[];
  future: DrawingSnapshot[];
}

interface DrawingSnapshot {
  mainPolygon: Polygon | null;
  subtractionZones: SubtractionZone[];
}

function takeSnapshot(state: CanvasState): DrawingSnapshot {
  return {
    mainPolygon: state.mainPolygon ? { ...state.mainPolygon, vertices: [...state.mainPolygon.vertices] } : null,
    subtractionZones: state.subtractionZones.map((z) => ({ ...z, vertices: [...z.vertices] })),
  };
}

function pushHistory(state: CanvasState): Pick<CanvasState, 'history' | 'future'> {
  const snapshot = takeSnapshot(state);
  return {
    history: [...state.history.slice(-HISTORY_LIMIT + 1), snapshot],
    future: [],
  };
}

export function getInitialState(persisted?: {
  bundleSizes?: BundleSize[];
  savedLawns?: SavedLawn[];
  unitSystem?: UnitSystem;
  overage?: number;
  activeBundleSizeId?: string;
}): CanvasState {
  const bundleSizes = persisted?.bundleSizes?.length ? persisted.bundleSizes : [DEFAULT_BUNDLE_SIZE];
  return {
    mainPolygon: null,
    subtractionZones: [],
    selectedPolygonId: null,
    mode: 'select',
    viewport: { offsetX: 0, offsetY: 0, scale: DEFAULT_SCALE },
    unitSystem: persisted?.unitSystem ?? 'metric',
    bundleSizes,
    activeBundleSizeId: persisted?.activeBundleSizeId ?? bundleSizes.find((b) => b.isDefault)?.id ?? bundleSizes[0].id,
    overage: persisted?.overage ?? DEFAULT_OVERAGE,
    savedLawns: persisted?.savedLawns ?? [],
    history: [],
    future: [],
  };
}

export function canvasReducer(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    // --- Shape placement ---
    case 'PLACE_SHAPE':
      return {
        ...state,
        ...pushHistory(state),
        mainPolygon: action.polygon,
        mode: 'select',
      };

    case 'CLEAR_SHAPE':
      return {
        ...state,
        ...pushHistory(state),
        mainPolygon: null,
        subtractionZones: [],
        selectedPolygonId: null,
        mode: 'select',
      };

    // --- Vertex editing ---
    case 'MOVE_VERTEX': {
      const { polygonId, vertexIndex, point } = action;
      if (state.mainPolygon?.id === polygonId) {
        const newVerts = [...state.mainPolygon.vertices];
        newVerts[vertexIndex] = point;
        return {
          ...state,
          ...pushHistory(state),
          mainPolygon: { ...state.mainPolygon, vertices: newVerts },
        };
      }
      // Check subtraction zones
      const zoneIdx = state.subtractionZones.findIndex((z) => z.id === polygonId);
      if (zoneIdx >= 0) {
        const newZones = [...state.subtractionZones];
        const zone = newZones[zoneIdx];
        const newVerts = [...zone.vertices];
        newVerts[vertexIndex] = point;
        newZones[zoneIdx] = { ...zone, vertices: newVerts };
        return { ...state, ...pushHistory(state), subtractionZones: newZones };
      }
      return state;
    }

    case 'INSERT_VERTEX': {
      const { polygonId, edgeIndex, point } = action;
      if (state.mainPolygon?.id === polygonId) {
        const newVerts = [...state.mainPolygon.vertices];
        newVerts.splice(edgeIndex + 1, 0, point);
        return {
          ...state,
          ...pushHistory(state),
          mainPolygon: { ...state.mainPolygon, vertices: newVerts },
        };
      }
      const zoneIdx = state.subtractionZones.findIndex((z) => z.id === polygonId);
      if (zoneIdx >= 0) {
        const newZones = [...state.subtractionZones];
        const zone = newZones[zoneIdx];
        const newVerts = [...zone.vertices];
        newVerts.splice(edgeIndex + 1, 0, point);
        newZones[zoneIdx] = { ...zone, vertices: newVerts };
        return { ...state, ...pushHistory(state), subtractionZones: newZones };
      }
      return state;
    }

    case 'DELETE_VERTEX': {
      const { polygonId, vertexIndex } = action;
      if (state.mainPolygon?.id === polygonId && state.mainPolygon.vertices.length > 3) {
        const newVerts = [...state.mainPolygon.vertices];
        newVerts.splice(vertexIndex, 1);
        return {
          ...state,
          ...pushHistory(state),
          mainPolygon: { ...state.mainPolygon, vertices: newVerts },
        };
      }
      const zoneIdx = state.subtractionZones.findIndex((z) => z.id === polygonId);
      if (zoneIdx >= 0 && state.subtractionZones[zoneIdx].vertices.length > 3) {
        const newZones = [...state.subtractionZones];
        const zone = newZones[zoneIdx];
        const newVerts = [...zone.vertices];
        newVerts.splice(vertexIndex, 1);
        newZones[zoneIdx] = { ...zone, vertices: newVerts };
        return { ...state, ...pushHistory(state), subtractionZones: newZones };
      }
      return state;
    }

    // --- Subtraction zones ---
    case 'ADD_SUBTRACTION':
      return {
        ...state,
        ...pushHistory(state),
        subtractionZones: [...state.subtractionZones, action.zone],
        mode: 'select',
      };

    case 'UPDATE_SUBTRACTION': {
      const newZones = state.subtractionZones.map((z) =>
        z.id === action.zoneId ? { ...z, vertices: action.vertices } : z
      );
      return { ...state, ...pushHistory(state), subtractionZones: newZones };
    }

    case 'DELETE_SUBTRACTION':
      return {
        ...state,
        ...pushHistory(state),
        subtractionZones: state.subtractionZones.filter((z) => z.id !== action.zoneId),
        selectedPolygonId: state.selectedPolygonId === action.zoneId ? null : state.selectedPolygonId,
      };

    // --- Mode ---
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SELECTED':
      return { ...state, selectedPolygonId: action.polygonId };

    // --- Viewport ---
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };

    // --- Settings ---
    case 'SET_UNIT_SYSTEM':
      return { ...state, unitSystem: action.unitSystem };

    case 'SET_OVERAGE':
      return { ...state, overage: action.percentage };

    case 'SET_ACTIVE_BUNDLE':
      return { ...state, activeBundleSizeId: action.bundleSizeId };

    case 'ADD_BUNDLE_SIZE':
      return { ...state, bundleSizes: [...state.bundleSizes, action.bundleSize] };

    case 'UPDATE_BUNDLE_SIZE':
      return {
        ...state,
        bundleSizes: state.bundleSizes.map((b) => (b.id === action.bundleSize.id ? action.bundleSize : b)),
      };

    case 'DELETE_BUNDLE_SIZE': {
      const remaining = state.bundleSizes.filter((b) => b.id !== action.bundleSizeId);
      const activeStillExists = remaining.some((b) => b.id === state.activeBundleSizeId);
      return {
        ...state,
        bundleSizes: remaining,
        activeBundleSizeId: activeStillExists ? state.activeBundleSizeId : remaining[0]?.id ?? '',
      };
    }

    case 'SET_DEFAULT_BUNDLE':
      return {
        ...state,
        bundleSizes: state.bundleSizes.map((b) => ({ ...b, isDefault: b.id === action.bundleSizeId })),
        activeBundleSizeId: action.bundleSizeId,
      };

    // --- Saved lawns ---
    case 'SAVE_LAWN':
      return {
        ...state,
        savedLawns: [
          ...state.savedLawns.filter((l) => l.id !== action.lawn.id),
          action.lawn,
        ],
      };

    case 'LOAD_LAWN':
      return {
        ...state,
        mainPolygon: action.lawn.mainPolygon,
        subtractionZones: action.lawn.subtractionZones,
        unitSystem: action.lawn.unitSystem,
        overage: action.lawn.overage,
        activeBundleSizeId: action.lawn.bundleSizeId,
        selectedPolygonId: null,
        mode: 'select',
        history: [],
        future: [],
      };

    case 'DELETE_LAWN':
      return {
        ...state,
        savedLawns: state.savedLawns.filter((l) => l.id !== action.lawnId),
      };

    // --- History ---
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const currentSnapshot = takeSnapshot(state);
      return {
        ...state,
        ...previous,
        history: state.history.slice(0, -1),
        future: [...state.future, currentSnapshot],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[state.future.length - 1];
      const currentSnapshot = takeSnapshot(state);
      return {
        ...state,
        ...next,
        history: [...state.history, currentSnapshot],
        future: state.future.slice(0, -1),
      };
    }

    default:
      return state;
  }
}
