import { useRef, useEffect, useCallback } from 'react';
import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { drawGrid } from './GridRenderer';
import { drawPolygon } from './PolygonRenderer';
import { drawVertexHandles } from './VertexHandles';
import { MeasurementOverlay } from './MeasurementOverlay';

export function DrawingCanvas() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const sizeRef = useRef({ width: 0, height: 0 });

  const { onPointerDown, onPointerMove, onPointerUp, onWheel } = useCanvasInteraction(
    state,
    dispatch,
    canvasRef
  );

  // Resize canvas to fill container
  const updateSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (sizeRef.current.width !== w || sizeRef.current.height !== h) {
      sizeRef.current = { width: w, height: h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    updateSize();
    const obs = new ResizeObserver(updateSize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [updateSize]);

  // Center viewport on first shape placement
  useEffect(() => {
    if (state.mainPolygon && state.viewport.offsetX === 0 && state.viewport.offsetY === 0) {
      const verts = state.mainPolygon.vertices;
      const cx = verts.reduce((s, v) => s + v.x, 0) / verts.length;
      const cy = verts.reduce((s, v) => s + v.y, 0) / verts.length;
      const { width, height } = sizeRef.current;
      dispatch({
        type: 'SET_VIEWPORT',
        viewport: {
          ...state.viewport,
          offsetX: width / 2 - cx * state.viewport.scale,
          offsetY: height / 2 - cy * state.viewport.scale,
        },
      });
    }
  }, [state.mainPolygon?.id]);

  // Render loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width, height } = sizeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Grid
      drawGrid(ctx, state.viewport, width, height);

      // Main polygon
      if (state.mainPolygon) {
        drawPolygon(ctx, state.mainPolygon, state.viewport, {
          fillColor: 'rgba(76, 175, 80, 0.15)',
          strokeColor: '#4CAF50',
          lineWidth: 2.5,
          isSelected: state.selectedPolygonId === state.mainPolygon.id,
        });

        drawVertexHandles(ctx, state.mainPolygon, state.viewport, {
          color: '#2563eb',
          showMidpointHandles: state.mode === 'select' &&
            (state.selectedPolygonId === state.mainPolygon.id || state.selectedPolygonId === null),
        });
      }

      // Subtraction zones
      for (const zone of state.subtractionZones) {
        drawPolygon(ctx, zone, state.viewport, {
          fillColor: 'rgba(255, 87, 34, 0.1)',
          strokeColor: '#FF5722',
          lineWidth: 2,
          isSelected: state.selectedPolygonId === zone.id,
          isSubtraction: true,
        });

        drawVertexHandles(ctx, zone, state.viewport, {
          color: '#FF5722',
          showMidpointHandles: state.selectedPolygonId === zone.id,
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state]);

  // Collect all polygons for measurement overlay
  const allPolygons = [];
  if (state.mainPolygon) allPolygons.push(state.mainPolygon);
  allPolygons.push(...state.subtractionZones);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{ touchAction: 'none' }}
      />
      <MeasurementOverlay
        polygons={allPolygons}
        viewport={state.viewport}
        unitSystem={state.unitSystem}
        width={sizeRef.current.width}
        height={sizeRef.current.height}
      />
    </div>
  );
}
