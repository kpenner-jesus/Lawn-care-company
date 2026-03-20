import type { Polygon } from '../../types/geometry';
import type { Viewport } from '../../utils/transform';
import { worldToScreen } from '../../utils/transform';
import { midpoint } from '../../utils/geometry';
import { VERTEX_HANDLE_RADIUS } from '../../constants';

export function drawVertexHandles(
  ctx: CanvasRenderingContext2D,
  polygon: Polygon,
  viewport: Viewport,
  options: {
    color: string;
    activeVertexIndex?: number;
    showMidpointHandles?: boolean;
  }
) {
  const { vertices, isClosed } = polygon;

  // Draw midpoint "+" handles on edges (for inserting vertices)
  if (options.showMidpointHandles && isClosed) {
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      const mid = midpoint(vertices[i], vertices[j]);
      const screenMid = worldToScreen(mid, viewport);

      ctx.beginPath();
      ctx.arc(screenMid.x, screenMid.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw "+" sign
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenMid.x - 3, screenMid.y);
      ctx.lineTo(screenMid.x + 3, screenMid.y);
      ctx.moveTo(screenMid.x, screenMid.y - 3);
      ctx.lineTo(screenMid.x, screenMid.y + 3);
      ctx.stroke();
      ctx.strokeStyle = '#fff';
    }
  }

  // Draw vertex circles
  for (let i = 0; i < vertices.length; i++) {
    const screenPos = worldToScreen(vertices[i], viewport);
    const isActive = options.activeVertexIndex === i;
    const radius = isActive ? VERTEX_HANDLE_RADIUS + 3 : VERTEX_HANDLE_RADIUS;

    // Outer ring
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? '#1d4ed8' : options.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}
