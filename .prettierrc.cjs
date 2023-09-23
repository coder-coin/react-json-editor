/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  jsxSingleQuote: false,
  useTabs: false,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.js",
};
