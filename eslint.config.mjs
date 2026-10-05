import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Playwright CLI scripts are evaluated inside its browser-control runtime.
  globalIgnores([".next/**", "output/**", "scripts/qa/**", "next-env.d.ts"]),
]);
