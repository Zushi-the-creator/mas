import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heb: ["Rubik", "Heebo", "Arial", "sans-serif"],
      },
      // מותג: צהוב-ירוק פסטל ("לימונדה") — רך, אופטימי, כספי-חיובי
      colors: {
        brand: {
          50: "#f8fbef",
          100: "#eef5d8",
          200: "#e0eebc",
          300: "#cde49a",
          400: "#b7d574",
          500: "#a3c95b",
          600: "#7fa63a",
          700: "#5d7f26",
          800: "#42591d",
        },
        butter: {
          100: "#fdf6d8",
          200: "#f9edb8",
          300: "#f4e194",
        },
        ink: "#26301a",
        soft: "#6b7460",
      },
      boxShadow: {
        pillow: "0 10px 30px -12px rgba(93, 127, 38, 0.25)",
        card: "0 2px 12px -4px rgba(38, 48, 26, 0.08)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ringPulse: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        popIn: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.45s ease-out both",
        ringPulse: "ringPulse 1.6s ease-out infinite",
        popIn: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
