import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      '8xl': '8.0625rem',
      '7xl': '6rem',
      '6xl': '4.5rem',
      '5xl': '4rem',
      '4xl': '3rem',
      '3xl': '2.5rem',
      '2xl': '2rem',
      xl: '1.5rem',
      lg: '1.25rem',
      base: '1.125rem',
      sm: '0.875rem',
      xs: '0.75rem',
      xxs: '0.625rem',
    },
    fontFamily: {
      'kadena': ['AreaNormal', 'sans-serif'],
      'Neue-Haas': ["'neue-haas-grotesk-text'", 'sans-serif'],
      'Space-Grotesk': ['var(--Space-Grotesk)', 'sans-serif']
    },
    extend: {
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            p: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
            h1: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
         },
            h2: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
            h3: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
            h4: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
            h5: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
            h6: {
              fontFamily: theme('fontFamily.kadena'),
              color: theme('colors.base-light'),
            },
          },
        },
      }),
      keyframes: {
        wobble: {
          '0%': { transform: 'translateX(0%)' },
          '15%': { transform: 'translateX(-25%) rotate(-5deg)' },
          '30%': { transform: 'translateX(20%) rotate(3deg)' },
          '45%': { transform: 'translateX(-15%) rotate(-3deg)' },
          '60%': { transform: 'translateX(10%) rotate(2deg)' },
          '75%': { transform: 'translateX(-5%) rotate(-1deg)' },
          '100%': { transform: 'translateX(0%)' },
        },
        bouncy: {
          '0%, 15%, 45%, 75%, 95%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-25px)' },
          '55%': { transform: 'translateY(-15px)' },
        },
        hithere: {
          '30%': { transform: 'scale(1.2)' },
          '40%, 60%': { transform: 'rotate(-20deg) scale(1.2)' },
          '50%': { transform: 'rotate(20deg) scale(1.2)' },
          '70%': { transform: 'rotate(0deg) scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        wobble: 'wobble 2s ease infinite',
        bouncy: 'bouncy 2s ease infinite',
        hithere: 'hithere 1.5s ease infinite',
      },
      lineHeight: {
        '110': '110%',
        '120': '120%',
        '130': '130%',
        '140': '140%',
        '150': '150%',
      },
      backgroundImage: {

        'basic-background':
          'radial-gradient(78.39% 78.07% at 34.5% 30.24%, #031223 0%, #0E2132 37.5%, #172D3E 67.71%, #203A4B 100%)',
        'lt-gradient':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.10) 100%)',
        'dark-opaque':
          'radial-gradient(82.01% 95.09% at 19.56% 18.12%, #0B1D2E 0%, #1F3849 100%)',
        dark: 'radial-gradient(at 47% 49%, hsla(209,60%,11%,1) 0px, transparent 50%),radial-gradient(at 0% 0%, hsla(201,37%,23%,1) 0px, transparent 50%),radial-gradient(at 100% 99%, hsla(201,37%,23%,1) 0px, transparent 50%),radial-gradient(at 16% 78%, hsla(209,61%,11%,1) 0px, transparent 50%),radial-gradient(at 86% 19%, hsla(209,60%,11%,1) 0px, transparent 50%)',
        'orange-linear':
          'linear-gradient(90deg, #F0EAE6 0.01%, #EDC4AB 47.42%, #E27B38 100.04%)',
        'pink-linear':
          'linear-gradient(90deg, rgba(255, 86, 152, 0.10) 0.01%, rgba(228, 25, 104, 0.80) 50%, #A90A48 99.99%)',
        'blue-linear':
          'linear-gradient(243deg, #122738 7.86%, #122738 33.11%, #1B3547 56.42%, #254151 81.18%, #436270 101.09%)',
        'green-linear':
          'linear-gradient(270deg, #C4E7DC -0.07%, rgba(196, 232, 221, 0.00) 100%)',
        'green-linear-2':
          'linear-gradient(270deg, #C4E9DD 69.77%, #5E9F8A 96.35%)',
        'dk-green-gradient':
          'linear-gradient(270deg, #C4E7DC -0.07%, #0F1D18 100%)',
        'dark-glass':
          'linear-gradient(180deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.10) 100%), radial-gradient(78.39% 78.07% at 34.5% 30.24%, #031223 0%, #0E2132 37.5%, #172D3E 67.71%, #203A4B 100%)',
        'arrow-gradient':
          'linear-gradient(189deg, #0F2333 11.79%, #21455D 44.8%, #142C3E 68.32%, #0F2333 98.62%)',
      },
      backdropBlur: {
        kBlur: 'blur(20px)',
      },
      boxShadow: {
        'pink-blur': '0px 4px 69px 0px rgba(228, 25, 104, 0.25)',
        'defi-pink-glow': '0px 3.231px 55.737px 0px rgba(228, 25, 104, 0.25)',
        'defi-orange-glow':
          '0px 3.231px 55.737px 0px rgba(250, 209, 225, 0.25)',
        'defi-pink-200-glow':
          '0px 3.231px 55.737px 0px rgba(250, 209, 225, 0.25)',
        'defi-green-glow': '0px 3.231px 55.737px 0px rgba(74, 144, 121, 0.25)',
      },
      transitionProperty: {
        'max-height': 'max-height',
      },
      colors: {
        'dark-blue': {
          100: '#E6E8EA',
          200: '#ACB4BA',
          300: '#5A6874',
          default: '#071D2F',
          500: '#05131F',
          600: '#020A10',
        },
        'k-Green': {
          100: '#EDF4F2',
          200: '#DBE9E4',
          300: '#B7D3C9',
          400: '#92BCAF',
          500: '#6EA694',
          default: '#4A9079',
          'default-transparent': 'rgba(74,144,121,0.6)',
          700: '#3B7361',
          800: '#2C5649',
          900: '#1E3A30',
          1000: '#0F1D18',
        },
        'k-Blue': {
          100: '#122738',
          200: '#C4C8CB',
          300: '#9DA5AB',
          400: '#6D7782',
          500: '#3C4A58',
          default: '#0B1D2E',
          700: '#091725',
          800: '#07111C',
          900: '#040C12',
        },
        'k-Cream': {
          200: '#FCFBFA',
          300: '#F9F7F5',
          400: '#F6F2F0',
          500: '#F3EEEB',
          default: '#F0EAE6',
          700: '#C0BBB8',
          800: '#908C8A',
          900: '#605E5C',
          1000: '#302F2E',
        },
        'k-Ltorange': {
          100: '#FDF9F7',
          200: '#FBF3EE',
          300: '#F8E7DD',
          400: '#F4DCCD',
          500: '#F1D0BC',
          default: '#EDC4AB',
          700: '#BE9D89',
          800: '#8E7667',
          900: '#5F4E44',
          1000: '#2F2722',
        },
        'k-Orange': {
          100: '#FCF2EB',
          200: '#F9E5D7',
          300: '#F3CAAF',
          400: '#EEB088',
          500: '#E89560',
          default: '#E27B38',
          700: '#B5622D',
          800: '#884A22',
          900: '#5A3116',
          1000: '#2D190B',
        },
        'k-Pink': {
          100: '#FCE8F0',
          200: '#FAD1E1',
          300: '#F4A3C3',
          400: '#EF75A4',
          500: '#E94786',
          default: '#E41968',
          700: '#B61453',
          800: '#890F3E',
          900: '#5B0A2A',
          1000: '#2E0515',
        },
        'base-light': '#FEFDFD',
        'base-dark': '#020609',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
