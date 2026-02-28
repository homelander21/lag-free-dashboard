import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg0: "#05070E",
        bg1: "#070A12",
        glass: "rgba(255,255,255,0.06)",
        stroke: "rgba(255,255,255,0.12)",
        neonBlue: "#2BD9FF",
        amdRed: "#FF2E62",
        ok: "#30F2A2",
        warn: "#FFC14A",
        bad: "#FF4D6D"
      },
      boxShadow: {
        glowBlue: "0 0 0 1px rgba(43,217,255,0.18), 0 0 24px rgba(43,217,255,0.18)",
        glowRed: "0 0 0 1px rgba(255,46,98,0.18), 0 0 24px rgba(255,46,98,0.18)"
      },
      backgroundImage: {
        "neon-radial":
          "radial-gradient(1200px 600px at 30% 10%, rgba(43,217,255,0.14), transparent 60%), radial-gradient(900px 500px at 80% 30%, rgba(255,46,98,0.12), transparent 55%), radial-gradient(900px 600px at 50% 110%, rgba(48,242,162,0.10), transparent 60%)",
        "amd-gradient": "linear-gradient(135deg, #2BD9FF 0%, #FF2E62 55%, #FF2E62 100%)"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-40%)" },
          "100%": { transform: "translateX(40%)" }
        },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" }
        }
      },
      animation: {
        shimmer: "shimmer 2.2s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;

