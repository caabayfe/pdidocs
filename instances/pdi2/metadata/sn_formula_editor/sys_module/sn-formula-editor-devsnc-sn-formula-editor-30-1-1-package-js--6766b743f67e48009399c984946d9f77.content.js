{
  "name": "@devsnc/sn-formula-editor",
  "version": "30.1.1",
  "private": false,
  "description": "A simple, no-code tool to write formulas when building tables in custom applications - update",
  "keywords": [
    "ServiceNow",
    "Seismic Component",
    "sn-formula-editor"
  ],
  "readme": "./README.md",
  "scripts": {
    "build:fluent": "now-sdk build --skip-clean --emitDictionary=false",
    "build": "tectonic pack && now-sdk build --skip-clean --frozenKeys --emitDictionary=false",
    "pretransform": "node -e \"require('node:fs').rmSync('.now/transform', { recursive: true, force: true })\"",
    "transform": "now-sdk download .now/transform --incremental && now-sdk transform --from .now/transform/update",
    "build:zip": "pnpm run build && now-sdk pack",
    "postbuild": "node .bin/translations.js da7ba86d3fe6d4098a93a0d6b1c40577",
    "ci:build": "pnpm install --frozen-lockfile && pnpm run build",
    "start": "tectonic develop --open",
    "test": "tectonic test unit && tectonic test functional",
    "precommit": "lint-staged",
    "func": "NODE_OPTIONS=--max_old_space_size=8192 tectonic test functional",
    "func:watch": "NODE_OPTIONS=--max_old_space_size=8192 tectonic test functional --singleRun=false",
    "unit": "tectonic test unit",
    "ci": "pnpm install --frozen-lockfile"
  },
  "repository": {
    "type": "git",
    "url": "https://code.devsnc.com/dev/devsnc-sn-formula-editor"
  },
  "engines": {
    "node": ">=14",
    "snc": "^30.1.0 || ^29.7.0"
  },
  "module": "src/index.js",
  "dependencies": {
    "@devsnc/library-formula-builder-ui-adapter": "1.0.5",
    "@servicenow/now-button": "28.2.0",
    "@servicenow/now-icon": "28.2.0",
    "@servicenow/now-loader": "28.2.0",
    "@servicenow/now-modal": "28.2.0",
    "@servicenow/now-popover": "28.2.0",
    "@servicenow/now-rich-text": "28.2.0",
    "@servicenow/sass-global": "28.2.0",
    "@servicenow/sass-kit": "28.2.0",
    "@servicenow/theme-polaris": "24.3.4",
    "@servicenow/sass-utility": "28.2.0",
    "@servicenow/ui-core": "28.0.12",
    "@servicenow/ui-renderer-snabbdom": "28.0.12",
    "sn-translate": "24.0.1",
    "monaco-editor": "0.25.0",
    "turndown": "6.0.0",
    "moo": "0.5.2"
  },
  "devDependencies": {
    "@babel/runtime": "7.27.1",
    "yargs": "17.7.2",
    "@babel/core": "7.27.1",
    "babel-eslint": "10.1.0",
    "@babel/traverse": "7.27.1",
    "@babel/generator": "7.27.1",
    "@babel/types": "7.27.1",
    "@tectonic/cli": "28.1.1",
    "@tectonic/eslint-plugin-tectonic": "28.1.1",
    "@tectonic/test-api": "28.1.1",
    "eslint": "7.2.0",
    "eslint-config-prettier": "6.11.0",
    "eslint-plugin-jsx-a11y": "6.3.1",
    "eslint-plugin-react": "7.20.2",
    "husky": "4.2.5",
    "lint-staged": "10.2.10",
    "prettier": "2.0.5",
    "nearley": "2.20.1",
    "expect": "29.7.0",
    "@devsnc/library-uxf": "28.1.3",
    "glob": "11.0.2",
    "@servicenow/sdk": "4.11.2"
  },
  "husky": {
    "hooks": {
      "pre-commit": "pnpm run precommit"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --config .prettierrc --write"
    ]
  },
  "now": {
    "id": "com.devsnc_sn_formula_editor",
    "scope": {
      "id": "addb5158e153e171e15ab8a283104d4c",
      "name": "sn_formula_editor"
    },
    "dependencies": [
      "com.glide.uxbuilder:sys",
      "com.servicenow_now_icon:sys",
      "com.servicenow_now_button:sys",
      "com.servicenow_now_loader:sys",
      "com.servicenow_now_popover:sys",
      "com.servicenow_now_rich_text:sys",
      "com.servicenow_now_modal:sys"
    ],
    "type": "standalone",
    "groupId": "com.snc.npm",
    "artifactId": "devsnc-sn-formula-editor",
    "repo": "sn-formula-editor",
    "targetVersion": "10.2026 - Table Builder Bundle"
  },
  "license": "UNLICENSED"
}
