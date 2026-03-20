import { useMemo } from 'react';
import type { Polygon } from '../../types/geometry';
import type { UnitSystem } from '../../types/settings';
import type { Viewport } from '../../utils/transform';
import { worldToScreen } from '../../utils/transform';
import { distance, midpoint, angle } from '../../utils/geometry';
import { formatLength } from '../../utils/units';

interface Props {
  polygons: Polygon[];
  viewport: Viewport;
  unitSystem: UnitSystem;
  width: number;
  height: number;
}

export function MeasurementOverlay({ polygons, viewport, unitSystem, width, height }: Props) {
  const labels = useMemo(() => {
    const result: { x: number; y: number; rotation: number; text: string; color: string }[] = [];

    for (const polygon of polygons) {
      const { vertices, isClosed } = polygon;
      const edgeCount = isClosed ? vertices.length : vertices.length - 1;
      const color = polygon.label ? '#FF5722' : '#1e40af';

      for (let i = 0; i < edgeCount; i++) {
        const a = vertices[i];
        const b = vertices[(i + 1) % vertices.length];
        const len = distance(a, b);
        if (len < 0.05) continue;

        const mid = midpoint(a, b);
        const screenMid = worldToScreen(mid, viewport);
        let angleDeg = (angle(a, b) * 180) / Math.PI;

        // Flip text so it's never upside down
        if (angleDeg > 90) angleDeg -= 180;
        if (angleDeg < -90) angleDeg += 180;

        // Offset perpendicular to the edge
        const perpAngle = angle(a, b) + Math.PI / 2;
        const offset = 16;
        const labelX = screenMid.x + Math.cos(perpAngle) * offset;
        const labelY = screenMid.y + Math.sin(perpAngle) * offset;

        result.push({
          x: labelX,
          y: labelY,
          rotation: angleDeg,
          text: formatLength(len, unitSystem),
          color,
        });
      }
    }

    return result;
  }, [polygons, viewport, unitSystem]);

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {labels.map((label, i) => (
        <g key={i} transform={`translate(${label.x}, ${label.y}) rotate(${label.rotation})`}>
          <rect
            x={-2}
            y={-12}
            width={label.text.length * 7.5 + 4}
            height={16}
            rx={3}
            fill="white"
            fillOpacity={0.9}
          />
          <text
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
            fill={label.color}
          >
            {label.text}
          </text>
        </g>
      ))}
    </svg>
  );
}
