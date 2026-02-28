export function Pill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "blue" | "ok" | "warn" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "blue"
      ? "border-neonBlue/20 bg-neonBlue/10 text-white"
      : tone === "ok"
        ? "border-ok/20 bg-ok/10 text-white"
        : tone === "warn"
          ? "border-warn/20 bg-warn/10 text-white"
          : tone === "bad"
            ? "border-bad/20 bg-bad/10 text-white"
            : "border-white/10 bg-white/5 text-white";

  return (
    <div className={["glass rounded-full px-3 py-1 shadow-sm", toneClass].join(" ")}>
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/65">{label}</span>
      <span className="ml-2 text-sm font-semibold">{value}</span>
    </div>
  );
}

