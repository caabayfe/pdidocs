
      {
  "name": "@devsnc/uibtk-api",
  "version": "29.0.31",
  "private": false,
  "description": "Builder API's scoped metadata records (script includes and endpoints)",
  "keywords": [
    "ServiceNow",
    "UIBTK"
  ],
  "readme": "./README.md",
  "scripts": {
    "build": "pnpm run cleanup && tsc --build && now-sdk build && tectonic pack && pnpm run fluent:restoreSysApp",
    "build:zip": "pnpm run build && mvn package",
    "cleanup": "rm -rf .now .tectonic .tectonic-depot dist target compiled-src",
    "fluent:syncVersionForSnapshotFix": "node ./tools/fluent-sync-version-for-snapshot-fix.mjs",
    "fluent:restoreSysApp": "git restore ./src/plugin-xmls/scope/sys_app_cdfd3bed43321110e70583020cb8f28e.xml",
    "verify": "tsc --noEmit"
  },
  "repository": {
    "type": "git",
    "url": "https://code.devsnc.com/dev/ui-builder-toolkit"
  },
  "engines": {
    "node": ">=14.16.0",
    "npm": ">=6.14.0"
  },
  "now": {
    "scope": "sn_uibtk_api",
    "scopeId": "cdfd3bed43321110e70583020cb8f28e",
    "metadataDir": "src/plugin-xmls",
    "serverModulesDir": "./../compiled-src/server-modules",
    "packOutputDir": "dist/target"
  },
  "module": "src/index.js",
  "dependencies": {
    "@devsnc/ux-rules-engine": "28.1.18",
    "@servicenow/glide": "^25.0.3"
  },
  "exports": {
    ".": "./compiled-src/server-modules/index.js"
  }
}
