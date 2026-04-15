/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./templates/**/*.html",
    "./apps/**/*.py",
    "./static/src/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101418",
        mist: "#f3efe7",
        clay: "#c96f4a",
        pine: "#355c4b",
        sand: "#e7d7bf",
        cobalt: "#3465ff",
        navy: "#112b5c",
        shell: "#f7f7f4",
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          300: "#9fbcff",
          400: "#6e93ff",
          500: "#465fff",
          600: "#3641f5",
          800: "#1e2268",
          950: "#17174b"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 20, 24, 0.12)",
        theme: "0 1px 2px rgba(16, 24, 40, 0.05)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ]
}
