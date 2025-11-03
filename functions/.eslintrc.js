module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["tsconfig.json", "tsconfig.dev.json"], // adjust if your TS configs are in a different path
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google"
  ],
  ignorePatterns: [
    "/lib/**/*",        // Ignore compiled JS files
    "/generated/**/*",  // Ignore generated files
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "import/no-unresolved": 0,
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-expressions": "off", // disables the problematic rule
  }
};
