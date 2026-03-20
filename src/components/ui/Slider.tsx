interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  valueLabel?: string;
  onChange: (val: number) => void;
}

export function Slider({ value, min, max, step = 1, label, valueLabel, onChange }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums">{valueLabel ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-gray-200 accent-blue-600 cursor-pointer"
      />
    </div>
  );
}
