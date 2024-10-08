
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
        customColor: 'rgba(4, 0, 75)',
      },
      backgroundImage: {
        'login-bg': "url('/asset/neenew.png')",
        'gradient-bg': 'linear-gradient(180deg, rgba(9,9,121,1) 0%, rgba(2,0,36,1) 35%, rgba(0,212,255,1) 100%)',
         'signup-bg' : "url('/asset/login.png')",
         'forgot-bg' : "url('/asset/forgot.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['"Edu Australia VIC WA NT Hand"'],
      },
    },
  },
  plugins: [],
};
export default config;
