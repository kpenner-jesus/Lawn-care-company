import type { Viewport } from '../../utils/transform';
import { GRID_MINOR_SPACING, GRID_MAJOR_SPACING } from '../../constants';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
) {
  const { offsetX, offsetY, scale } = viewport;

  // Visible world bounds
  const worldLeft = -offsetX / scale;
  const worldTop = -offsetY / scale;
  const worldRight = (canvasWidth - offsetX) / scale;
  const worldBottom = (canvasHeight - offsetY) / scale;

  // Minor grid
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 0.5;
  drawGridLines(ctx, viewport, worldLeft, worldTop, worldRight, worldBottom, GRID_MINOR_SPACING);

  // Major grid
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  drawGridLines(ctx, viewport, worldLeft, worldTop, worldRight, worldBottom, GRID_MAJOR_SPACING);

  // Origin axes
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Horizontal axis
  const y0 = offsetY;
  if (y0 >= 0 && y0 <= canvasHeight) {
    ctx.moveTo(0, y0);
    ctx.lineTo(canvasWidth, y0);
  }
  // Vertical axis
  const x0 = offsetX;
  if (x0 >= 0 && x0 <= canvasWidth) {
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, canvasHeight);
  }
  ctx.stroke();
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  worldLeft: number,
  worldTop: number,
  worldRight: number,
  worldBottom: number,
  spacing: number
) {
  const { offsetX, offsetY, scale } = viewport;

  const startX = Math.floor(worldLeft / spacing) * spacing;
  const startY = Math.floor(worldTop / spacing) * spacing;

  ctx.beginPath();

  // Vertical lines
  for (let wx = startX; wx <= worldRight; wx += spacing) {
    const sx = wx * scale + offsetX;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, ctx.canvas.height);
  }

  // Horizontal lines
  for (let wy = startY; wy <= worldBottom; wy += spacing) {
    const sy = wy * scale + offsetY;
    ctx.moveTo(0, sy);
    ctx.lineTo(ctx.canvas.width, sy);
  }

  ctx.stroke();
}
