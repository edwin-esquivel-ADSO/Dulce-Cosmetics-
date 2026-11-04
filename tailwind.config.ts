import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./backend/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7b5455",
          container: "#f4c2c2",
          fixed: "#ffdad9",
          "fixed-dim": "#ecbaba",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#734e4e",
          fixed: "#2f1314",
          "fixed-variant": "#613d3e",
        },
        "inverse-primary": "#ecbaba",
        secondary: {
          DEFAULT: "#5e604d",
          container: "#e1e1c9",
          fixed: "#e4e4cc",
          "fixed-dim": "#c8c8b0",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#636451",
          fixed: "#1b1d0e",
          "fixed-variant": "#474836",
        },
        tertiary: {
          DEFAULT: "#735c00",
          container: "#f1ca50",
          fixed: "#ffe088",
          "fixed-dim": "#e9c349",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#6b5500",
          fixed: "#241a00",
          "fixed-variant": "#574500",
        },
        surface: {
          DEFAULT: "#f9f9f9",
          dim: "#dadada",
          bright: "#f9f9f9",
          tint: "#7b5455",
          variant: "#e2e2e2",
          "container-lowest": "#ffffff",
          "container-low": "#f3f3f4",
          container: "#eeeeee",
          "container-high": "#e8e8e8",
          "container-highest": "#e2e2e2",
        },
        "on-surface": {
          DEFAULT: "#1a1c1c",
          variant: "#504444",
        },
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f0f1f1",
        background: "#f9f9f9",
        "on-background": "#1a1c1c",
        outline: {
          DEFAULT: "#827473",
          variant: "#d4c2c2",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#93000a",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#EEDC82",
          dark: "#AA820A",
        },
        beige: {
          DEFAULT: "#F5F5DC",
          soft: "#FAF9F6",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        "display-lg": ["var(--font-playfair)", "Playfair Display", "serif"],
        "headline-lg": ["var(--font-playfair)", "Playfair Display", "serif"],
        "headline-md": ["var(--font-playfair)", "Playfair Display", "serif"],
        "body-lg": ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        "body-md": ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        "label-md": ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        "label-sm": ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      spacing: {
        base: "8px",
        "container-max": "1280px",
        "gutter-desktop": "32px",
        "gutter-mobile": "16px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "section-gap": "100px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
