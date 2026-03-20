import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import { Button } from '../ui/Button';

export function Toolbar() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();

  const hasShape = !!state.mainPolygon;
  const isSubtractMode = state.mode === 'subtract' || state.mode === 'place-subtract';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasShape && (
        <>
          <Button
            variant={isSubtractMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              if (isSubtractMode) {
                dispatch({ type: 'SET_MODE', mode: 'select' });
              } else {
                dispatch({ type: 'SET_MODE', mode: 'place-subtract' });
              }
            }}
          >
            {isSubtractMode ? 'Exit Subtract' : 'Subtract Area'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={state.history.length === 0}
          >
            Undo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={state.future.length === 0}
          >
            Redo
          </Button>

          {state.selectedPolygonId && state.subtractionZones.some((z) => z.id === state.selectedPolygonId) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (state.selectedPolygonId) {
                  dispatch({ type: 'DELETE_SUBTRACTION', zoneId: state.selectedPolygonId });
                }
              }}
            >
              Delete Zone
            </Button>
          )}

          <div className="flex-1" />

          <Button
            variant="danger"
            size="sm"
            onClick={() => dispatch({ type: 'CLEAR_SHAPE' })}
          >
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
