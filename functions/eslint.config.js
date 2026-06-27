const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const globals = require("globals");

module.exports = [
  {
    ignores: ["lib/**/*", "generated/**/*", "*.js"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: ["tsconfig.json"],
      },
      globals: {
        ...globals.node,
        ...globals.es2015,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "import": importPlugin,
    },
    rules: {
      ...tseslint.configs["recommended"].rules,
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "import/no-unresolved": 0,
    },
  },
];
