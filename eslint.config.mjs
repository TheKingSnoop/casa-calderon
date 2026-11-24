import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Must come last: turns off ESLint rules that conflict with Prettier,
  // so ESLint checks code quality and Prettier owns formatting.
  prettier,
  {
    rules: {
      // Allow dropping a field via rest destructuring, e.g.
      // `const { body: _body, ...card } = project` to omit `body`.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "out-e2e/**",
    "playwright-report/**",
    "test-results/**",
    // infra/ is a separate package (AWS CDK) with its own type-check and tests
    "infra/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
