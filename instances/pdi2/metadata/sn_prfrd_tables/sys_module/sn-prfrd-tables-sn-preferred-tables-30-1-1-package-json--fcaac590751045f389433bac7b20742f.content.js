{
  "name": "sn-preferred-tables",
  "version": "30.1.1",
  "now": {
    "id": "com.devsnc_sn_prfrd_tables",
    "scope": {
      "id": "de7c09b877e2111031e3b3c64b5a994a",
      "name": "sn_prfrd_tables"
    },
    "dependencies": [],
    "type": "standalone",
    "groupId": "com.snc",
    "artifactId": "devsnc-sn-preferred-tables",
    "repo": "sn-preferred-tables",
    "targetVersion": "10.2026 - Table Builder Bundle"
  },
  "engines": {
    "snc": "^30.1.0 || ^29.7.0"
  },
  "description": "Global Preferred tables list",
  "license": "UNLICENSED",
  "devDependencies": {
    "@servicenow/sdk": "4.11.2",
    "eslint": "9.39.4"
  },
  "scripts": {
    "build:fluent": "now-sdk build --emitDictionary=false",
    "ci:build": "npm ci && now-sdk build --frozenKeys --emitDictionary=false",
    "pretransform": "node -e \"require('node:fs').rmSync('.now/transform', { recursive: true, force: true })\"",
    "transform": "now-sdk download .now/transform --incremental && now-sdk transform --from .now/transform/update",
    "lint:fluent": "eslint eslint.config.js \"src/fluent/**/*.server.js\""
  }
}
