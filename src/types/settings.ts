export type UnitSystem = 'metric' | 'imperial';

export interface BundleSize {
  id: string;
  name: string;
  width: number;  // always stored in metres
  height: number; // always stored in metres
  isDefault: boolean;
}

export interface OverageConfig {
  percentage: number; // 0-50
}
