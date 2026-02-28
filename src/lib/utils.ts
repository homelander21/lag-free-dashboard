export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export function gradeFromMetrics(pingMs: number, jitterMs: number, lossPct: number): Grade {
  // Weighted "gaming feel" grade (simple + deterministic for simulated UI).
  const score =
    100 -
    (pingMs * 0.9 + jitterMs * 2.2 + lossPct * 18);

  if (score >= 92) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 62) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function gradeColor(grade: Grade) {
  switch (grade) {
    case "A+":
    case "A":
      return "text-ok";
    case "B":
    case "C":
      return "text-warn";
    case "D":
    case "F":
      return "text-bad";
  }
}

export function gradeRingStops(grade: Grade) {
  switch (grade) {
    case "A+":
    case "A":
      return { a: "#2BD9FF", b: "#30F2A2" };
    case "B":
    case "C":
      return { a: "#2BD9FF", b: "#FFC14A" };
    case "D":
    case "F":
      return { a: "#FF2E62", b: "#FFC14A" };
  }
}

