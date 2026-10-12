{
  "name": "sn_experiment_core",
  "version": "1.1.20",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "build": "now-sdk build",
    "ci": "pnpm install --frozen-lockfile && pnpm run build",
    "ci:build": "pnpm install --frozen-lockfile && pnpm run build:zip",
    "test:server": "node --test src/test/js/*.test.js",
    "unit": "pnpm run extract && pnpm run cov",
    "extract": "nu extract",
    "build:zip": "pnpm run build && now-sdk build && mvn package -P !node-build",
    "verify": "npm run test",
    "cov": "nu mocha -m ci -- --timeout 10000 --require @babel/register --require node_modules/@servicenow/commons-test-js-utils/src/sdlc-annotation.js --recursive src/test/js/"
  },
  "devDependencies": {
    "@tectonic/cli": "27.4.1",
    "@tectonic/karma-plugin": "27.4.1",
    "@tectonic/seismic-testing-helpers": "27.4.1",
    "@tectonic/test-api": "27.4.1",
    "@servicenow/sdk": "4.2.0",
    "@servicenow/glide": "26.0.1",
    "eslint": "8.50.0",
    "@servicenow/eslint-plugin-sdk-app-plugin": "3.0.3",
    "typescript": "5.5.4",
    "prettier": "^3.3.2",
    "eslint-config-prettier": "^9.1.0"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.6.2",
  "now": {
    "id": "com.sn_experiment_core",
    "scope": {
      "id": "fa5da291ffb32210ff52ffffffffff42",
      "name": "sn_experiment_core"
    },
    "dependencies": [
      "com.glide.data_services.base:sys"
    ],
    "type": "standalone",
    "groupId": "com.snc.npm",
    "artifactId": "experimentation-framework-core",
    "repo": "experimentation-framework",
    "targetVersion": "SR - PCF - Experimentation Framework Bundle - v1.2"
  },
  "engines": {
    "snc": "^28.11.0 || ^29.4.0 || ^30.0.0"
  }
}
