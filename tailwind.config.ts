import type { Config } from "tailwindcss";

// Calm dark OT-ops surface. Severity/zone accents live in lib/tokens.ts (applied inline).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ot: {
          bg: "#0a0e13",        // app background
          surface: "#10151c",   // cards / strip
          panel: "#151b24",     // raised panels
          hover: "#1b232e",
          border: "#222c38",
          line: "#2a3543",
          text: "#e6edf3",
          muted: "#8b97a7",
          dim: "#5b6675",
          accent: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulseSoft: { "0%,100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
