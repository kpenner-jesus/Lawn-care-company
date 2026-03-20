import type { Polygon, SubtractionZone } from './geometry';
import type { UnitSystem } from './settings';

export interface SavedLawn {
  id: string;
  name: string;
  mainPolygon: Polygon;
  subtractionZones: SubtractionZone[];
  bundleSizeId: string;
  overage: number;
  unitSystem: UnitSystem;
  createdAt: number;
  updatedAt: number;
}
