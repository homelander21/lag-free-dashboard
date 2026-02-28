import { clamp } from "../../lib/utils";

export function Slider({
  value,
  min = 0,
  max = 200,
  step = 1,
  onChange,
  label,
  suffix = "Mbps"
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  label: string;
  suffix?: string;
}) {
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-white/65">
        <div className="uppercase tracking-[0.18em]">{label}</div>
        <div className="font-semibold text-white/85">
          {value === 0 ? "Unlimited" : `${value}${suffix ? ` ${suffix}` : ""}`}
        </div>
      </div>
      <div className="relative">
        <div className="h-2 rounded-full bg-white/10" />
        <div
          className="absolute top-0 h-2 rounded-full bg-amd-gradient shadow-glowBlue"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute -top-1 h-4 w-4 rounded-full bg-white/80 shadow"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

