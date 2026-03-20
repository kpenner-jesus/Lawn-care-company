import type { Point, Polygon } from '../../types/geometry';
import type { Viewport } from '../../utils/transform';
import { worldToScreen } from '../../utils/transform';

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: Polygon,
  viewport: Viewport,
  options: {
    fillColor: string;
    strokeColor: string;
    lineWidth: number;
    isSelected?: boolean;
    isSubtraction?: boolean;
  }
) {
  const { vertices, isClosed } = polygon;
  if (vertices.length < 2) return;

  const screenVerts = vertices.map((v) => worldToScreen(v, viewport));

  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }
  if (isClosed) ctx.closePath();

  if (isClosed) {
    if (options.isSubtraction) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
      drawHatch(ctx, screenVerts);
    } else {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
  }

  // Rebuild the polygon path since drawHatch replaces it
  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }
  if (isClosed) ctx.closePath();

  ctx.strokeStyle = options.strokeColor;
  ctx.lineWidth = options.lineWidth;
  if (options.isSelected) {
    ctx.setLineDash([6, 3]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHatch(ctx: CanvasRenderingContext2D, screenVerts: Point[]) {
  // Draw diagonal lines inside the polygon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }
  ctx.closePath();
  ctx.clip();

  // Find bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of screenVerts) {
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    maxX = Math.max(maxX, v.x);
    maxY = Math.max(maxY, v.y);
  }

  const spacing = 8;
  ctx.strokeStyle = 'rgba(255, 87, 34, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let d = minX + minY - (maxX - minX); d < maxX + maxY; d += spacing) {
    ctx.moveTo(d - minY, minY);
    ctx.lineTo(d - maxY, maxY);
  }
  ctx.stroke();
  ctx.restore();
}
