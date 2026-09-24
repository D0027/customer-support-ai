/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        graphite: "var(--graphite)",
        panel: "var(--panel)",
        paper: "var(--paper)",
        signal: "#2F6F5E",
        signalBright: "#3FA98A",
        amber: "#E8A33D",
        danger: "#D9564A",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        panel: "20px",
        chat: "14px",
      },
      boxShadow: {
        panel: "0 20px 60px -20px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(63,169,138,0.4), 0 0 24px rgba(63,169,138,0.25)",
        "glow-lg": "0 0 40px rgba(63,169,138,0.35), 0 0 80px rgba(63,169,138,0.15)",
        lift: "0 8px 24px -8px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};