import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      keyframes: {
        blurFadeUp: {
          "0%": {
            opacity: "0",
            filter: "blur(20px)",
            transform: "translateY(40px)",
          },
          "100%": {
            opacity: "1",
            filter: "blur(0)",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "blur-fade-up": "blurFadeUp 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
