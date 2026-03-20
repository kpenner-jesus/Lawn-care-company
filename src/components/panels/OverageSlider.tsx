import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import { Slider } from '../ui/Slider';

export function OverageSlider() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();

  return (
    <div className="space-y-1">
      <Slider
        label="Overage"
        value={state.overage}
        min={0}
        max={50}
        step={1}
        valueLabel={`${state.overage}%`}
        onChange={(val) => dispatch({ type: 'SET_OVERAGE', percentage: val })}
      />
      {state.overage >= 5 && state.overage <= 10 && (
        <p className="text-[10px] text-green-600">Recommended range for cuts & seams</p>
      )}
      {state.overage < 5 && (
        <p className="text-[10px] text-amber-600">We recommend 5-10% extra for cuts & seams</p>
      )}
    </div>
  );
}
