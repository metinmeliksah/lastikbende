import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // Mor (ana renk)
        'primary-dark': '#6d28d9', // Koyu mor
        'primary-light': '#8b5cf6', // Açık mor
        dark: {
          100: '#4b5563', // En açık gri
          200: '#374151', // Orta açık gri
          300: '#1f2937', // Orta koyu gri
          400: '#111827', // En koyu gri (arka plan)
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config; 