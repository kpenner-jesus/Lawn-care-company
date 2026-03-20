import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import { Toggle } from '../ui/Toggle';

export function UnitToggle() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();

  return (
    <Toggle
      value={state.unitSystem === 'imperial'}
      onChange={(isImperial) =>
        dispatch({ type: 'SET_UNIT_SYSTEM', unitSystem: isImperial ? 'imperial' : 'metric' })
      }
      labelLeft="Metres"
      labelRight="Feet"
    />
  );
}
