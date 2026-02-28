export function Toggle({
  checked,
  onChange,
  label,
  sub
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition",
        "hover:bg-white/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] active:scale-[0.99]"
      ].join(" ")}
      aria-pressed={checked}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white/90">{label}</div>
        {sub ? <div className="mt-1 truncate text-xs text-white/55">{sub}</div> : null}
      </div>
      <div
        className={[
          "relative h-7 w-12 rounded-full border transition",
          checked ? "border-neonBlue/30 bg-neonBlue/20 shadow-glowBlue" : "border-white/15 bg-white/5"
        ].join(" ")}
      >
        <div
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white/80 shadow transition",
            checked ? "left-6" : "left-1"
          ].join(" ")}
        />
      </div>
    </button>
  );
}

