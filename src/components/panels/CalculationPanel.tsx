import { useCanvasState } from '../../state/canvas-context';
import { useMeasurements } from '../../hooks/useMeasurements';
import { formatArea } from '../../utils/units';

export function CalculationPanel() {
  const state = useCanvasState();
  const calc = useMeasurements();
  const bundle = state.bundleSizes.find((b) => b.id === state.activeBundleSizeId);

  if (!calc) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        Select a shape to start calculating
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Gross Area"
          value={formatArea(calc.grossAreaSqM, state.unitSystem)}
        />
        <StatCard
          label="Subtract"
          value={calc.subtractedAreaSqM > 0 ? `- ${formatArea(calc.subtractedAreaSqM, state.unitSystem)}` : '--'}
        />
        <StatCard
          label="Net Area"
          value={formatArea(calc.netAreaSqM, state.unitSystem)}
          highlight
        />
        <StatCard
          label={`Bundles (${bundle?.name ?? ''})`}
          value={`${calc.withOverage}`}
          sublabel={calc.overagePercent > 0 ? `${calc.rawCount} + ${calc.overagePercent}% overage` : undefined}
          highlight
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sublabel, highlight }: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
