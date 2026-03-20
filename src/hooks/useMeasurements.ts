import { useMemo } from 'react';
import { useCanvasState } from '../state/canvas-context';
import { polygonArea } from '../utils/geometry';
import { calculateBundles, type BundleCalcResult } from '../utils/bundles';

export function useMeasurements(): BundleCalcResult | null {
  const state = useCanvasState();

  return useMemo(() => {
    if (!state.mainPolygon?.isClosed) return null;

    const grossArea = polygonArea(state.mainPolygon.vertices);
    const subtractedArea = state.subtractionZones.reduce(
      (sum, zone) => sum + (zone.isClosed ? polygonArea(zone.vertices) : 0),
      0
    );

    const bundle = state.bundleSizes.find((b) => b.id === state.activeBundleSizeId) ?? state.bundleSizes[0];
    if (!bundle) return null;

    return calculateBundles(grossArea, subtractedArea, bundle, state.overage);
  }, [
    state.mainPolygon?.vertices,
    state.mainPolygon?.isClosed,
    state.subtractionZones,
    state.bundleSizes,
    state.activeBundleSizeId,
    state.overage,
  ]);
}
