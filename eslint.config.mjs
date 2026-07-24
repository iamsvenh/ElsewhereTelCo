// Strict-from-day-one lint. Adapted from Borker's config (the TS-general half;
// all the React/Next/a11y rules dropped — this repo is a Bun server + static
// HTML + persona TS). We enforce zero warnings from the start deliberately:
// Borker waited and now carries a ~1500-item backlog.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-config-prettier/flat";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "apps/web/**", // static HTML/CSS/inline JS — not linted here
      "audio snippets/**",
      "**/*.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: { "unused-imports": unusedImports },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      // The headline: no `any`. Type events/payloads explicitly.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-imports": "error",

      // General hygiene.
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }], // allow `== null` idiom
      curly: ["error", "all"],
      "no-nested-ternary": "error",
      "no-debugger": "error",
      // Swallowing errors during socket teardown is intentional (best-effort close).
      "no-empty": ["error", { allowEmptyCatch: true }],

      // This IS a server: stdout is its observability surface, so console is
      // expected. F7 (redaction) governs WHAT is logged, not whether.
      "no-console": "off",
    },
  },
  {
    // Test files: allow the non-null assertions that keep fixtures terse.
    files: ["tests/**/*.ts"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
  // MUST be last: turns off every stylistic rule Prettier owns, so ESLint and
  // Prettier never fight. Formatting is Prettier's job; lint is correctness.
  prettier,
);
