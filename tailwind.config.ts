import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{tsx,ts,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

export default config;
