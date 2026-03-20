interface Props {
  value: boolean;
  onChange: (val: boolean) => void;
  labelLeft: string;
  labelRight: string;
}

export function Toggle({ value, onChange, labelLeft, labelRight }: Props) {
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className={`font-medium ${!value ? 'text-gray-900' : 'text-gray-400'}`}>{labelLeft}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
          transition-colors cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
            transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      <span className={`font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>{labelRight}</span>
    </div>
  );
}
