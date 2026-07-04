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
        surface: "var(--surface)",
        border: "var(--border)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        batman: "var(--batman-accent)",
        bruce: "var(--bruce-accent)",
        alert: "var(--alert)",
        rain: "var(--rain)",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
        mono: ['var(--font-jetbrains)'],
      },
      keyframes: {
        rain: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '10% 100%' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      },
      animation: {
        rain: 'rain 0.8s linear infinite',
        flicker: 'flicker 5s infinite',
        scanline: 'scanline 10s linear infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
