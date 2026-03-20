import { useRef, useCallback } from 'react';
import type { Dispatch } from 'react';
import type { Point } from '../types/geometry';
import type { Action } from '../state/actions';
import type { CanvasState } from '../state/canvas-reducer';
import { screenToWorld, zoomAtPoint } from '../utils/transform';
import { snapToGrid } from '../utils/snap';
import { hitTestPolygons } from '../utils/hitTest';
import { MIN_ZOOM, MAX_ZOOM, SNAP_THRESHOLD_WORLD } from '../constants';

interface PointerState {
  pointerId: number;
  startScreen: Point;
  currentScreen: Point;
}

interface DragState {
  polygonId: string;
  vertexIndex: number;
  startWorld: Point;
}

export function useCanvasInteraction(
  state: CanvasState,
  dispatch: Dispatch<Action>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const pointers = useRef<Map<number, PointerState>>(new Map());
  const dragState = useRef<DragState | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef<{ offsetX: number; offsetY: number; screenX: number; screenY: number } | null>(null);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(1);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCanvasPoint = useCallback((e: React.PointerEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [canvasRef]);

  const getAllPolygons = useCallback(() => {
    const polys = [];
    if (state.mainPolygon) polys.push(state.mainPolygon);
    polys.push(...state.subtractionZones);
    return polys;
  }, [state.mainPolygon, state.subtractionZones]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const screenPoint = getCanvasPoint(e);
    pointers.current.set(e.pointerId, {
      pointerId: e.pointerId,
      startScreen: screenPoint,
      currentScreen: screenPoint,
    });

    // Two-finger pinch
    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].currentScreen.x - pts[1].currentScreen.x;
      const dy = pts[0].currentScreen.y - pts[1].currentScreen.y;
      pinchStartDist.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartScale.current = state.viewport.scale;
      isPanning.current = false;
      dragState.current = null;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      return;
    }

    // Single pointer — check hit test
    if (state.mode === 'select' && state.mainPolygon) {
      const hit = hitTestPolygons(screenPoint, getAllPolygons(), state.viewport);

      if (hit?.type === 'vertex') {
        dragState.current = {
          polygonId: hit.polygonId,
          vertexIndex: hit.vertexIndex,
          startWorld: screenToWorld(screenPoint, state.viewport),
        };
        dispatch({ type: 'SET_SELECTED', polygonId: hit.polygonId });

        // Long press for delete
        longPressTimer.current = setTimeout(() => {
          if (dragState.current) {
            const moved = pointers.current.get(e.pointerId);
            if (moved) {
              const dx = moved.currentScreen.x - moved.startScreen.x;
              const dy = moved.currentScreen.y - moved.startScreen.y;
              if (Math.sqrt(dx * dx + dy * dy) < 10) {
                dispatch({
                  type: 'DELETE_VERTEX',
                  polygonId: dragState.current.polygonId,
                  vertexIndex: dragState.current.vertexIndex,
                });
                dragState.current = null;
              }
            }
          }
        }, 600);
        return;
      }

      if (hit?.type === 'edge-midpoint') {
        dispatch({
          type: 'INSERT_VERTEX',
          polygonId: hit.polygonId,
          edgeIndex: hit.edgeIndex,
          point: hit.point,
        });
        // Start dragging the newly inserted vertex
        dragState.current = {
          polygonId: hit.polygonId,
          vertexIndex: hit.edgeIndex + 1,
          startWorld: hit.point,
        };
        return;
      }
    }

    // No hit — start panning
    isPanning.current = true;
    panStart.current = {
      offsetX: state.viewport.offsetX,
      offsetY: state.viewport.offsetY,
      screenX: screenPoint.x,
      screenY: screenPoint.y,
    };
  }, [state.mode, state.mainPolygon, state.viewport, canvasRef, getCanvasPoint, getAllPolygons, dispatch]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const screenPoint = getCanvasPoint(e);
    const ptr = pointers.current.get(e.pointerId);
    if (ptr) ptr.currentScreen = screenPoint;

    // Pinch zoom
    if (pointers.current.size === 2 && pinchStartDist.current !== null) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].currentScreen.x - pts[1].currentScreen.x;
      const dy = pts[0].currentScreen.y - pts[1].currentScreen.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / pinchStartDist.current;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchStartScale.current * ratio));

      const midX = (pts[0].currentScreen.x + pts[1].currentScreen.x) / 2;
      const midY = (pts[0].currentScreen.y + pts[1].currentScreen.y) / 2;

      dispatch({
        type: 'SET_VIEWPORT',
        viewport: zoomAtPoint(state.viewport, { x: midX, y: midY }, newScale),
      });
      return;
    }

    // Dragging a vertex
    if (dragState.current && pointers.current.size === 1) {
      const worldPoint = screenToWorld(screenPoint, state.viewport);
      const snapped = snapToGrid(worldPoint, SNAP_THRESHOLD_WORLD / state.viewport.scale * 40);
      dispatch({
        type: 'MOVE_VERTEX',
        polygonId: dragState.current.polygonId,
        vertexIndex: dragState.current.vertexIndex,
        point: snapped,
      });

      // Cancel long press if moved
      const dx = screenPoint.x - (ptr?.startScreen.x ?? 0);
      const dy = screenPoint.y - (ptr?.startScreen.y ?? 0);
      if (Math.sqrt(dx * dx + dy * dy) > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      return;
    }

    // Panning
    if (isPanning.current && panStart.current && pointers.current.size === 1) {
      dispatch({
        type: 'SET_VIEWPORT',
        viewport: {
          ...state.viewport,
          offsetX: panStart.current.offsetX + (screenPoint.x - panStart.current.screenX),
          offsetY: panStart.current.offsetY + (screenPoint.y - panStart.current.screenY),
        },
      });
    }
  }, [getCanvasPoint, state.viewport, dispatch]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (pointers.current.size === 0) {
      dragState.current = null;
      isPanning.current = false;
      panStart.current = null;
      pinchStartDist.current = null;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const screenPoint = getCanvasPoint(e as unknown as React.PointerEvent);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.viewport.scale * delta));
    dispatch({
      type: 'SET_VIEWPORT',
      viewport: zoomAtPoint(state.viewport, screenPoint, newScale),
    });
  }, [getCanvasPoint, state.viewport, dispatch]);

  return { onPointerDown, onPointerMove, onPointerUp, onWheel };
}
