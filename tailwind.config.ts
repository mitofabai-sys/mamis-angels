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
        background: "var(--background)",
        foreground: "var(--foreground)",
        pixel: {
          bg: "#C5D8E8",       // page background — soft powder blue
          navy: "#172452",     // dark navy — headings, primary buttons
          blue: "#3B7FCE",     // royal blue — accents, hover
          light: "#6BA7D0",    // sky blue — borders, subtle accents
          card: "#EEF5FA",     // slightly blue-tinted white for cards
          muted: "#8AA8BF",    // muted blue-gray for secondary text
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        pixel: "4px 4px 0px #172452",
        "pixel-sm": "2px 2px 0px #172452",
        "pixel-blue": "4px 4px 0px #3B7FCE",
      },
    },
  },
  plugins: [],
};
export default config;
