{
  "name": "@servicenow/sn-ip-survey",
  "version": "29.0.4",
  "private": true,
  "description": "In-Product Survey - Seismic bridge component and REST telemetry endpoint for IPS",
  "keywords": [
    "ServiceNow",
    "In-Product Survey",
    "IPS"
  ],
  "readme": "./README.md",
  "packageManager": "pnpm@10.17.0",
  "scripts": {
    "prepare": "husky install",
    "ci": "pnpm install --frozen-lockfile && pnpm run build:combined",
    "clean": "rm -rf ./target && pnpm -r exec rm -rf target",
    "build:now-sdk": "now-sdk build && node scripts/substitute-plugin-xml.js",
    "build:components": "pnpm -r --filter './src/seismic/*' run build",
    "build:assemble": "node scripts/assemble-build.js",
    "build:combined": "pnpm run clean && pnpm run build:now-sdk && pnpm run build:components && pnpm run build:assemble",
    "deploy": "now-sdk pack && now-sdk install -s",
    "pack": "now-sdk pack",
    "package:skill": "./scripts/package-skill.sh",
    "update:skill": "./scripts/update-skill.sh",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "lint": "eslint . --quiet && prettier . --check",
    "lint:fix": "eslint . --fix --quiet; prettier . --write || (echo 'ERROR: lint:fix failed - Check errors above' && exit 1)",
    "version": "node scripts/sync-version.js",
    "postversion": "prettier . --write",
    "release:perform": "pnpm run build:combined && pnpm -r publish --no-git-checks",
    "verify": "node scripts/check-npmignore.js && pnpm run lint && pnpm -r run test"
  },
  "repository": {
    "type": "git",
    "url": "https://code.devsnc.com/dev/in-product-survey"
  },
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "@servicenow/sass-kit": "28.9.1",
    "@servicenow/ui-core": "28.0.15",
    "@servicenow/ui-renderer-snabbdom": "28.0.15"
  },
  "devDependencies": {
    "@devsnc/eslint-config-ux": "1.2.5",
    "@devsnc/prettier-config-ux": "1.2.5",
    "@servicenow/eslint-plugin-sdk-app-plugin": "4.2.0",
    "@servicenow/glide": "27.0.3",
    "@servicenow/sdk": "4.2.0",
    "@servicenow/sdk-cli": "4.2.0",
    "@tectonic/cli": "28.0.1",
    "@tectonic/eslint-plugin-tectonic": "28.0.1",
    "@tectonic/test-api": "28.0.1",
    "eslint": "^8.0.0",
    "husky": "8.0.3",
    "lint-staged": "16.2.7",
    "prettier": "3.8.1",
    "typescript": "5.9.3"
  },
  "eslintConfig": {
    "root": true,
    "extends": "@devsnc/eslint-config-ux"
  },
  "prettier": "@devsnc/prettier-config-ux",
  "pnpm": {
    "overrides": {
      "node-sass": "npm:sass@1.58.0"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,scss,css}": [
      "prettier --write"
    ]
  }
}
