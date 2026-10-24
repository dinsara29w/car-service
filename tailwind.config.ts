import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#22A559",
          50: "#ECFDF3",
          100: "#D9F7E5",
          200: "#B5EDCD",
          300: "#86DEAF",
          400: "#51C88B",
          500: "#22A559",
          600: "#178647",
          700: "#146B3B",
          800: "#135531",
          900: "#10462A",
        },
        ink: {
          DEFAULT: "#0F3D2E",
          soft: "#36584B",
          muted: "#6B8078",
        },
        canvas: "#F5F8F6",
        line: "#E2EAE5",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 61, 46, 0.04), 0 8px 24px rgba(15, 61, 46, 0.04)",
        lift: "0 12px 36px rgba(15, 61, 46, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "toast-in": "toast-in 180ms ease-out",
        "fade-up": "fade-up 250ms ease-out both",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
