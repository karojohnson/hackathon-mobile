import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Git worktrees live under .claude/worktrees/ and are full copies of
    // the source. Without this, `npm run lint` from the repo root lints the
    // codebase twice and reports hundreds of duplicate errors from whatever
    // in-progress state a worktree happens to be in.
    ".claude/**",
  ]),
]);

export default eslintConfig;
