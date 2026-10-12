{
  "name": "sn_mid_admin_ws",
  "version": "2.0.1",
  "description": "MID Admin Workspace",
  "license": "UNLICENSED",
  "scripts": {
    "build": "now-sdk build",
    "ci:build": "npm ci && npm run build && npm run fixers",
    "deploy": "now-sdk install",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "fixers": "npm run fix-metadata && npm run fix-document-id-choice",
    "fix-metadata": "node build-tools/metadata-file-structure-fixer.js",
    "fix-document-id-choice": "node build-tools/document-id-choice-fixer.js",
    "extract": "npx nu extract",
    "cov": "npx nu mocha -m ci --",
    "unit": "npm run extract && npm run cov",
    "test": "npm run unit",
    "test:mocha": "npx mocha",
    "test:coverage": "npx nyc mocha",
    "coverage:html": "nyc report --reporter=html --report-dir coverage",
    "clean:coverage": "rm -rf coverage .nyc_output"
  },
  "devDependencies": {
    "@servicenow/sdk": "4.2.0",
    "@servicenow/glide": "26.0.1",
    "eslint": "8.50.0",
    "@servicenow/eslint-plugin-sdk-app-plugin": "3.0.3",
    "@servicenow/commons-test-js-utils": "^2.0.3",
    "now-unit": "^3.2.0",
    "chai": "^4.4.1",
    "sinon": "^17.0.1",
    "sinon-chai": "^3.7.0",
    "@babel/core": "^7.25.0",
    "@babel/preset-env": "^7.25.0",
    "@babel/register": "^7.25.0",
    "babel-plugin-module-resolver": "^5.0.0"
  },
  "nyc": {
    "reporter": [
      "text",
      "lcov",
      "html"
    ],
    "report-dir": "coverage"
  },
  "report-dir": "target",
  "all": true,
  "cache": false,
  "now": {
    "id": "com.sn_mid_admin_ws",
    "scope": {
      "id": "2e77d2ecf523ee54f877e8fd7f61853f",
      "name": "sn_mid_admin_ws"
    },
    "dependencies": [],
    "type": "standalone",
    "groupId": "com.snc",
    "artifactId": "mid-admin-workspace",
    "repo": "mid-admin-workspace",
    "targetVersion": ""
  },
  "engines": {
    "snc": "^28.4.0 || ^27.10.0 || ^29.0.0"
  }
}
