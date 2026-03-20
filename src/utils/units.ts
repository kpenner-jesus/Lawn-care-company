import type { UnitSystem } from '../types/settings';
import { M_TO_FT, SQM_TO_SQFT } from '../constants';

export function convertLength(metres: number, unit: UnitSystem): number {
  return unit === 'imperial' ? metres * M_TO_FT : metres;
}

export function convertArea(sqMetres: number, unit: UnitSystem): number {
  return unit === 'imperial' ? sqMetres * SQM_TO_SQFT : sqMetres;
}

export function formatLength(metres: number, unit: UnitSystem): string {
  const value = convertLength(metres, unit);
  const suffix = unit === 'imperial' ? 'ft' : 'm';
  return `${value.toFixed(1)} ${suffix}`;
}

export function formatArea(sqMetres: number, unit: UnitSystem): string {
  const value = convertArea(sqMetres, unit);
  const suffix = unit === 'imperial' ? 'ft²' : 'm²';
  return `${value.toFixed(1)} ${suffix}`;
}

/** Convert a user-entered length back to metres for storage */
export function toMetres(value: number, unit: UnitSystem): number {
  return unit === 'imperial' ? value / M_TO_FT : value;
}
