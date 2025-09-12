/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        "finance-tracker-dark": {
          "base-100": "oklch(26% 0.079 36.259)",
          "base-200": "oklch(40% 0.123 38.172)",
          "base-300": "oklch(47% 0.137 46.201)",
          "base-content": "oklch(95% 0.038 75.164)",
          "primary": "oklch(70% 0.213 47.604)",
          "primary-content": "oklch(98% 0.019 200.873)",
          "secondary": "oklch(57% 0.245 27.325)",
          "secondary-content": "oklch(97% 0.013 17.38)",
          "accent": "oklch(0% 0 0)",
          "accent-content": "oklch(100% 0 0)",
          "neutral": "oklch(55% 0.163 48.998)",
          "neutral-content": "oklch(98% 0.016 73.684)",
          "info": "oklch(68% 0.169 237.323)",
          "info-content": "oklch(97% 0.013 236.62)",
          "success": "oklch(70% 0.14 182.503)",
          "success-content": "oklch(98% 0.014 180.72)",
          "warning": "oklch(79% 0.184 86.047)",
          "warning-content": "oklch(98% 0.026 102.212)",
          "error": "oklch(64% 0.246 16.439)",
          "error-content": "oklch(96% 0.015 12.422)",
        }
      }
    ],
    darkTheme: "finance-tracker-dark",
  },
}

