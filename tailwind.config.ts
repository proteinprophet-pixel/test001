import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        track: {
          950: "#090a0d",
          900: "#0e1014",
          850: "#14171d",
          800: "#1a1e26",
          700: "#262b36",
          600: "#363d4c",
        },
        volt: {
          300: "#e4ff4f",
          400: "#ccff00",
          500: "#b5e600",
          600: "#92b800",
        },
        race: {
          orange: "#ff5722",
          red: "#f43f5e",
          crimson: "#e11d48",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "volt-glow": "0 0 25px -5px rgba(204, 255, 0, 0.35)",
        "race-glow": "0 0 25px -5px rgba(255, 87, 34, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
