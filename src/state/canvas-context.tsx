import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { canvasReducer, getInitialState, type CanvasState } from './canvas-reducer';
import type { Action } from './actions';

const CanvasStateContext = createContext<CanvasState | null>(null);
const CanvasDispatchContext = createContext<Dispatch<Action> | null>(null);

const LS_KEYS = {
  bundleSizes: 'sod-calc:bundle-sizes',
  savedLawns: 'sod-calc:saved-lawns',
  unitSystem: 'sod-calc:unit-system',
  overage: 'sod-calc:overage',
  activeBundleSizeId: 'sod-calc:active-bundle',
};

function loadPersisted() {
  try {
    return {
      bundleSizes: JSON.parse(localStorage.getItem(LS_KEYS.bundleSizes) ?? 'null') ?? undefined,
      savedLawns: JSON.parse(localStorage.getItem(LS_KEYS.savedLawns) ?? 'null') ?? undefined,
      unitSystem: (localStorage.getItem(LS_KEYS.unitSystem) as 'metric' | 'imperial') ?? undefined,
      overage: JSON.parse(localStorage.getItem(LS_KEYS.overage) ?? 'null') ?? undefined,
      activeBundleSizeId: localStorage.getItem(LS_KEYS.activeBundleSizeId) ?? undefined,
    };
  } catch {
    return {};
  }
}

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, undefined, () => getInitialState(loadPersisted()));

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.bundleSizes, JSON.stringify(state.bundleSizes));
      localStorage.setItem(LS_KEYS.savedLawns, JSON.stringify(state.savedLawns));
      localStorage.setItem(LS_KEYS.unitSystem, state.unitSystem);
      localStorage.setItem(LS_KEYS.overage, JSON.stringify(state.overage));
      localStorage.setItem(LS_KEYS.activeBundleSizeId, state.activeBundleSizeId);
    } catch {
      // localStorage full or unavailable
    }
  }, [state.bundleSizes, state.savedLawns, state.unitSystem, state.overage, state.activeBundleSizeId]);

  return (
    <CanvasStateContext.Provider value={state}>
      <CanvasDispatchContext.Provider value={dispatch}>
        {children}
      </CanvasDispatchContext.Provider>
    </CanvasStateContext.Provider>
  );
}

export function useCanvasState(): CanvasState {
  const ctx = useContext(CanvasStateContext);
  if (!ctx) throw new Error('useCanvasState must be used within CanvasProvider');
  return ctx;
}

export function useCanvasDispatch(): Dispatch<Action> {
  const ctx = useContext(CanvasDispatchContext);
  if (!ctx) throw new Error('useCanvasDispatch must be used within CanvasProvider');
  return ctx;
}
