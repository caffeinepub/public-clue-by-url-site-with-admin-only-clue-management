/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        michroma: ['Michroma', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        echofields: {
          green: 'var(--echofields-green)',
        },
        liminal: {
          glass: {
            bg: 'var(--liminal-glass-bg)',
            border: 'var(--liminal-glass-border)',
            highlight: 'var(--liminal-glass-highlight)',
            shadow: 'var(--liminal-glass-shadow)',
            glow: 'var(--liminal-glass-glow)',
          },
          accent: 'var(--liminal-accent)',
          text: 'var(--liminal-text)',
          muted: 'var(--liminal-muted)',
          warning: 'var(--liminal-warning)',
        },
      },
      keyframes: {
        fadeInZoom: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.5)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.15)',
          },
          '75%': {
            opacity: '1',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        liminalGlow: {
          '0%, 100%': {
            boxShadow: '0 0 12px var(--liminal-glass-glow)',
          },
          '50%': {
            boxShadow: '0 0 20px var(--liminal-glass-glow), 0 0 32px var(--liminal-glass-glow)',
          },
        },
      },
      animation: {
        fadeInZoom: 'fadeInZoom 3s ease-in-out',
        shimmer: 'shimmer 3s ease-in-out infinite',
        liminalGlow: 'liminalGlow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'liminal-gradient': 'linear-gradient(135deg, var(--liminal-glass-highlight), var(--liminal-glass-bg))',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
