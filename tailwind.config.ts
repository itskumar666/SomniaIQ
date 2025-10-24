import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        somnia: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
          dark: "#0f0f23",
          darker: "#1a1a2e",
        },
      },
      backgroundImage: {
        'gradient-somnia': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      },
    },
  },
  plugins: [],
};
export default config;