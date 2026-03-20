import type { Point } from '../types/geometry';

export interface ShapeTemplate {
  id: string;
  name: string;
  icon: string;
  /** Vertices in metres, centered around origin */
  vertices: Point[];
}

export const SHAPE_TEMPLATES: ShapeTemplate[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: '▭',
    vertices: [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
  },
  {
    id: 'l-shape',
    name: 'L-Shape',
    icon: '⌐',
    vertices: [
      { x: -5, y: -4 },
      { x: 2, y: -4 },
      { x: 2, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
  },
  {
    id: 't-shape',
    name: 'T-Shape',
    icon: '⊤',
    vertices: [
      { x: -6, y: -4 },
      { x: 6, y: -4 },
      { x: 6, y: -1 },
      { x: 3, y: -1 },
      { x: 3, y: 4 },
      { x: -3, y: 4 },
      { x: -3, y: -1 },
      { x: -6, y: -1 },
    ],
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    icon: '⏢',
    vertices: [
      { x: -3, y: -4 },
      { x: 3, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle',
    icon: '△',
    vertices: [
      { x: 0, y: -5 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
  },
];

/** Offset all vertices so the shape is centered at a given world point */
export function placeTemplate(template: ShapeTemplate, center: Point): Point[] {
  return template.vertices.map((v) => ({
    x: v.x + center.x,
    y: v.y + center.y,
  }));
}
