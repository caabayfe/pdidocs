{
  "name": "knowledge-center-aiux",
  "private": true,
  "version": "0.1.0",
  "description": "AIUX — Knowledge Center",
  "type": "module",
  "packageManager": "pnpm@10.33.2",
  "scripts": {
    "dev": "now-sdk run dev",
    "serve": "echo \"pnpm run serve is no longer available for use here, because @servicenow/aiux is the public package that does not include runtime code. To use pnpm run serve, you need to clone the karuna repo, and run it from there.\"",
    "build": "now-sdk build",
    "deploy": "now-sdk install",
    "test": "NODE_OPTIONS='--no-warnings' npx vitest run",
    "test:watch": "NODE_OPTIONS='--no-warnings' npx vitest",
    "test:ui": "NODE_OPTIONS='--no-warnings' npx vitest --ui",
    "test:ui:coverage": "NODE_OPTIONS='--no-warnings' npx vitest --ui --coverage",
    "test:coverage": "NODE_OPTIONS='--no-warnings' npx vitest run --coverage",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "format:write": "prettier --write ."
  },
  "dependencies": {
    "@lit/localize": "0.12.2",
    "@servicenow/aiux": "22.56.0",
    "@servicenow/aiux-client": "1.26.1",
    "@servicenow/aiux-components-core": "6.5.1",
    "@servicenow/aiux-directive-icon": "1.4.2",
    "@servicenow/aiux-services": "0.17.8",
    "lit": "3.3.3"
  },
  "devDependencies": {
    "@babel/core": "^7.29.7",
    "@babel/eslint-parser": "7.28.6",
    "@babel/plugin-proposal-decorators": "^7.29.0",
    "@babel/preset-typescript": "^7.28.5",
    "@eslint/js": "^9.39.1",
    "@servicenow/sdk": "4.11.0",
    "@servicenow/vitest-sdlc-reporter": "^3.2.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitest/coverage-istanbul": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "eslint": "9.39.2",
    "eslint-plugin-import": "^2.32.0",
    "globals": "^16.0.0",
    "happy-dom": "^15.0.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^7.0.0",
    "vitest": "^2.0.0"
  },
  "aiux": {
    "basename": "knowledge"
  },
  "engines": {
    "node": ">=24.14.1"
  }
}
