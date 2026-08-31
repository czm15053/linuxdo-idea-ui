import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        // Discourse 站点注入的全局
        MessageBus: "readonly",
        Ember: "readonly",
        Discourse: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "scripts/**"],
  },
];
