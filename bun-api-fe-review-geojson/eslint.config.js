import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "src/client/src/routeTree.gen.ts"],
  },
];
