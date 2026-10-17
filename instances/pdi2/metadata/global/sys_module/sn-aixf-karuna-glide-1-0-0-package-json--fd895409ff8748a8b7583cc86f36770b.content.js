{
  "name": "karuna-glide",
  "version": "1.0.0",
  "private": true,
  "description": "AI Experience Framework",
  "engines": {
    "npm": ">=8.0.0",
    "node": "20.18.0",
    "snc": "^28.9.0"
  },
  "type": "module",
  "devDependencies": {
    "@servicenow/sdk": "4.2.0",
    "@servicenow/eslint-plugin-sdk-app-plugin": "4.2.0",
    "@servicenow/glide": "27.0.3",
    "@babel/preset-env": "^7.29.2",
    "@babel/register": "^7.28.6",
    "@servicenow/commons-test-js-utils": "^2.0.4",
    "@servicenow/grit": "^3.2.0",
    "acorn": "^8.15.0",
    "acorn-walk": "^8.3.4",
    "babel-plugin-module-resolver": "^5.0.3",
    "chai": "^4.1.2",
    "now-unit": "^3.2.0",
    "nyc": "^17.1.0",
    "sinon": "^21.0.0"
  },
  "scripts": {
    "ci": "npm install --frozen-lockfile",
    "ci:build": "npm run ci && now-sdk build",
    "clean": "rm -rf node_modules node dist .now @types target",
    "rebuild": "npm run clean && npm run ci:build",
    "build": "now-sdk build",
    "deploy": "now-sdk deploy",
    "transform": "now-sdk transform --mode incremental",
    "fetch": "now-sdk fetch",
    "dependencies": "now-sdk dependencies",
    "extract": "nu extract",
    "cov": "nu mocha -m ci -- --timeout 10000 --require @babel/register --require node_modules/@servicenow/commons-test-js-utils/src/sdlc-annotation.js --recursive src/test/js/",
    "test": "npm run extract && npm run cov"
  },
  "license": "ISC",
  "now": {
    "id": "com.glide.sn_aixf",
    "scope": {
      "id": "2a2785427e4c429cb9f7c8a8b475e6f1",
      "name": "sn_aixf"
    },
    "dependencies": [
      "com.glide.ui.ng:sys",
      "com.glideapp.user_criteria:sys"
    ],
    "type": "standalone",
    "groupId": "com.snc",
    "artifactId": "app-aixf",
    "repo": "karuna-glide",
    "targetVersion": ""
  }
}
