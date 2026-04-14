import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:        "#FF8C42",
          "orange-light": "#FFB380",
          "orange-pale":  "#FFE8D6",
          beige:         "#FFF5EB",
          "beige-dark":  "#F5E6D3",
          "gray-soft":   "#6B7280",
          "off-white":   "#FAFAFA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(107, 114, 128, 0.08)",
        card: "0 1px 3px rgba(107, 114, 128, 0.12), 0 1px 2px rgba(107, 114, 128, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
