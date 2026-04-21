/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#27272a",
        input: "#27272a",
        ring: "#ffffff",
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#18181b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#18181b",
          foreground: "#a1a1aa",
        },
        card: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        brand: {
          accent: "#81c995", // Google Green-ish
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "float": "float 8s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 4s infinite",
        "pulse-square": "pulse-square 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.19, 1, 0.22, 1) backwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "page-enter": "page-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shine": "shine 2s linear infinite",
        "grid-flow": "grid-flow 8s linear infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
      },
      keyframes: {
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-square": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.9)" },
        },
        "slide-up": {
           "0%": { opacity: "0", transform: "translateY(20px)" },
           "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "shine": {
          "from": { backgroundPosition: "200% center" },
          "to": { backgroundPosition: "-200% center" }
        },
        "grid-flow": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(60px)" }
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.1)" }
        }
      }
    },
  },
  plugins: [],
}
