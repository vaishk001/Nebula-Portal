
import type { Config } from "tailwindcss";

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom Nebula Colors
        nebula: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "nebula-flow": {
          "0%": {
            transform: "translate(-50%, -50%) rotate(0deg) scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translate(-50%, -50%) rotate(180deg) scale(1.1)",
            opacity: "0.7",
          },
          "100%": {
            transform: "translate(-50%, -50%) rotate(360deg) scale(1)",
            opacity: "0.6",
          },
        },
        "float": {
          "0%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-10px) translateX(10px)" },
          "50%": { transform: "translateY(0px) translateX(20px)" },
          "75%": { transform: "translateY(10px) translateX(10px)" },
          "100%": { transform: "translateY(0px) translateX(0px)" },
        },
        "comet": {
          "0%": { transform: "translateX(-100px) rotate(5deg)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "40%": { opacity: "0.2" },
          "60%": { opacity: "0" },
          "100%": { transform: "translateX(calc(100vw + 100px)) rotate(5deg)", opacity: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(var(--orbit-distance)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-distance)) rotate(-360deg)" }
        },
        "star-twinkle": {
          "0%": { opacity: "0.4", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "0.4", transform: "scale(0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "nebula-flow": "nebula-flow 30s linear infinite",
        "float": "float 15s ease-in-out infinite",
        "comet": "comet 8s ease-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "orbit": "orbit var(--duration, 30s) linear infinite",
        "star-twinkle": "star-twinkle 3s ease-in-out infinite", 
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
