
      {
  "name": "@devsnc/ux-rules-engine",
  "version": "28.1.18",
  "description": "A custom ServiceNow application",
  "license": "UNLICENSED",
  "contributors": [],
  "scripts": {
    "build": "rimraf dist && tsc --project tsconfig.build.json && node build-minify.mjs",
    "build:zip": "npm run build && mvn package -P !node-build",
    "ci": "npm ci && npm run build",
    "test": "jest",
    "verify": "tsc --noEmit && eslint './src/**/*.ts' --config ./.eslintrc --no-eslintrc && prettier ./src/ -c && npm run test && npm run sonar",
    "sonar": "NO_TEST=true ./.bin/sonar"
  },
  "repository": {
    "type": "git",
    "url": "https://code.devsnc.com/dev/ux-rules-engine.git"
  },
  "engines": {
    "node": ">=16.20.2",
    "npm": ">=8.5.5"
  },
  "devDependencies": {
    "@babel/preset-typescript": "7.23.3",
    "@devsnc/ui-builder-types": "1.0.26",
    "@types/lodash": "4.14.202",
    "@types/jest": "29.5.11",
    "@typescript-eslint/eslint-plugin": "6.20.0",
    "@typescript-eslint/parser": "6.20.0",
    "esbuild": "0.20.0",
    "eslint": "8.56.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-import": "2.29.1",
    "jest": "29.7.0",
    "prettier": "3.2.4",
    "rimraf": "5.0.5",
    "ts-jest": "29.1.2",
    "ts-node": "10.9.2",
    "typescript": "5.3.3"
  },
  "dependencies": {
    "dist": "1.0.0"
  },
  "types": "dist/types/index.d.ts",
  "readme": "ERROR: No README data found!",
  "_id": "@devsnc/ux-rules-engine@28.1.18",
  "exports": {
    "./tsconfig": "./tsconfig.js",
    "./tsconfig.build": "./tsconfig.build.js",
    "./dist/ux-rules-engine.esm": "./dist/ux-rules-engine.esm.js",
    ".": "./dist/ux-rules-engine.cjs.js"
  }
}
