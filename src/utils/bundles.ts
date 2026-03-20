import type { BundleSize } from '../types/settings';

export interface BundleCalcResult {
  bundleAreaSqM: number;
  grossAreaSqM: number;
  subtractedAreaSqM: number;
  netAreaSqM: number;
  rawCount: number;
  withOverage: number;
  overagePercent: number;
}

export function calculateBundles(
  grossAreaSqM: number,
  subtractedAreaSqM: number,
  bundle: BundleSize,
  overagePercent: number
): BundleCalcResult {
  const netAreaSqM = Math.max(0, grossAreaSqM - subtractedAreaSqM);
  const bundleAreaSqM = bundle.width * bundle.height;
  const rawCount = bundleAreaSqM > 0 ? Math.ceil(netAreaSqM / bundleAreaSqM) : 0;
  const areaWithOverage = netAreaSqM * (1 + overagePercent / 100);
  const withOverage = bundleAreaSqM > 0 ? Math.ceil(areaWithOverage / bundleAreaSqM) : 0;

  return {
    bundleAreaSqM,
    grossAreaSqM,
    subtractedAreaSqM,
    netAreaSqM,
    rawCount,
    withOverage,
    overagePercent,
  };
}
