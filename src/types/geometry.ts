export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: string;
  vertices: Point[];
  isClosed: boolean;
  label?: string;
}

export interface SubtractionZone extends Polygon {
  label: string;
}
