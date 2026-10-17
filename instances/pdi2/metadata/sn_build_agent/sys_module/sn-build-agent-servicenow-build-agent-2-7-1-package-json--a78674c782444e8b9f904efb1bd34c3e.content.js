{
  "name": "@servicenow/build-agent",
  "version": "2.7.1",
  "description": "Build Agent",
  "license": "UNLICENSED",
  "scripts": {
    "build": "npm run build:extension && npm run save-test-reports && npm run build:fluent && npm run restore-test-reports && npm run combine-artifacts",
    "build:ci": "npm ci && npm run save-target && npm run delete-target && npm run check:keys && npm run build && npm run fix-git && npm run restore-target && npm run copy-to-target && npm run clean-target",
    "build:fluent": "rm -rf dist && now-sdk build --emitDictionary=false && cp src/main/plugins/com.sn_build_agent/plugin.xml dist/app/plugin.xml && npm --prefix idex run sync-extension-record",
    "check:keys": "now-sdk build --frozenKeys",
    "build:extension": "mvn -f idex/pom.xml clean install -U && ([ \"$SKIP_TESTS\" = \"true\" ] || npm run test)",
    "clean": "rm -rf dist combined-dist target .target-backup .test-reports-backup idex/dist idex/target",
    "clean:cache": "rm -rf .now .jest_cache .tmp .build coverage",
    "clean:maven-cache": "rm -rf ~/.m2/repository/com/sn_idex_bae ~/.m2/repository/com/sn_build_agent",
    "clean-target": "rm target/combined-build-app.zip",
    "check:prettier": "eslint-config-prettier \"**/*.{js,ts,mjs,cjs}\"",
    "combine-artifacts": "node scripts/combine-artifacts.mjs",
    "copy-to-target": "mkdir -p target/com.sn_build_agent/ && cp -r combined-dist/* target/com.sn_build_agent/",
    "delete-target": "[ -d target ] && rm -rf target || true && [ -d idex/target ] && rm -rf idex/target || true",
    "deploy:all-nodes": "node deployment-plans/deploy-all-nodes.mjs",
    "deploy": "npm run smart-build && now-sdk deploy -s --maven && npm run upload:globalFiles",
    "deploy:fluent": "npm run build:fluent && now-sdk deploy",
    "deploy:full": "npm run build && now-sdk deploy -s --maven",
    "deploy:extension": "npm run build:extension && node idex/scripts/deploy.mjs",
    "enable-mock-wdf": "node scripts/enableMockWdfEndpoint.mjs",
    "fix-git": "node scripts/fix-git.mjs",
    "ks2fluent": "node scripts/ks2fluent.mjs",
    "mr-clean": "npm run clean && echo 'All clean! Build artifacts removed.'",
    "mr-clean-deep": "npm run mr-clean && npm run clean:maven-cache && git clean -fxd && echo 'Deep clean complete!'",
    "prepare": "husky && node scripts/install-merge-driver.mjs",
    "restore-target": "[ -d .target-backup ] && [ -d target ] && cp -r .target-backup/* target/ && rm -rf .target-backup || true",
    "restore-test-reports": "mkdir -p target && ([ -d .test-reports-backup/surefire-reports ] && cp -r .test-reports-backup/surefire-reports target/ || true) && ([ -d .test-reports-backup/sdlc-reports ] && cp -r .test-reports-backup/sdlc-reports target/ || true) && ([ -f .test-reports-backup/sdlc_api.annotations ] && cp .test-reports-backup/sdlc_api.annotations target/ || true) && rm -rf .test-reports-backup",
    "save-target": "rm -rf .target-backup && mkdir -p .target-backup && [ -d target ] && cp -r target/* .target-backup/ || true",
    "save-test-reports": "mkdir -p .test-reports-backup && ([ -d target/surefire-reports ] && cp -r target/surefire-reports .test-reports-backup/ || true) && ([ -d target/sdlc-reports ] && cp -r target/sdlc-reports .test-reports-backup/ || true) && ([ -f target/sdlc_api.annotations ] && cp target/sdlc_api.annotations .test-reports-backup/ || true)",
    "smart-build": "node scripts/smart-build.mjs",
    "start": "node scripts/start-server.mjs",
    "sync-versions": "node scripts/sync-versions.mjs",
    "test": "rm -rf coverage && jest --coverage --runInBand",
    "test:ba-studio": "jest --testPathPatterns=ba-studio --runInBand",
    "test:ba-studio:watch": "jest --testPathPatterns=ba-studio --watch --runInBand",
    "test:idex": "npm test -- --testPathPatterns=idex --runInBand",
    "test:merge-keys": "node --test scripts/merge-keys.test.mjs",
    "test:webview": "jest --testPathPatterns=puppeteer\\.test\\.js --runInBand",
    "//test:smoke": "Change BASE_URL, TEST_USERNAME, TEST_PASSWORD as needed before running",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "upload:globalFiles": "node scripts/globalFileInstall.mjs",
    "generate:validator": "node deployment-plans/validate-instance.bg.js"
  },
  "lint-staged": {
    "idex/**/*.{js,ts,mjs,cjs}": [
      "cd idex && npx eslint --fix",
      "prettier --write"
    ],
    "scripts/**/*.{js,ts,mjs,cjs}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{js,ts,mjs,cjs}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@servicenow/glide": "26.0.1",
    "@servicenow/jest-sdlc-reporter": "3.0.2",
    "@servicenow/sdk": "4.13.0",
    "@servicenow/vscode-ide": "1.2.9",
    "@types/jest": "^30.0.0",
    "@typescript-eslint/eslint-plugin": "6.21.0",
    "@typescript-eslint/parser": "6.21.0",
    "eslint": "8.50.0",
    "eslint-config-prettier": "10.1.5",
    "eslint-plugin-prettier": "5.5.1",
    "husky": "9.1.7",
    "inquirer": "^12.6.3",
    "iot-app-tools": "3.0.0",
    "jest": "^30.0.4",
    "jest-environment-jsdom": "^30.4.1",
    "jest-junit": "^16.0.0",
    "lint-staged": "16.1.2",
    "prettier": "3.6.0",
    "puppeteer": "^24.15.0",
    "ts-jest": "^29.4.0",
    "typescript": "5.5.4",
    "zx": "^8.5.5"
  },
  "dependencies": {
    "clean-git-ref": "2.0.1"
  },
  "now": {
    "id": "com.sn_build_agent",
    "scope": {
      "id": "6805ff49c0eb46ee969d42f0dd56b3bf",
      "name": "sn_build_agent"
    },
    "dependencies": [
      "sn_glider:5.1.0",
      "com.glide.app_build_agent_core.global:sys",
      "com.glide.tokenbased_auth:sys"
    ],
    "groupId": "com.snc",
    "artifactId": "build_agent",
    "repo": "idex-builder-agent",
    "targetVersion": "10.2026 - Build Agent"
  },
  "engines": {
    "node": ">=24.0.0",
    "snc": "^30.1.0 || ^29.7.0"
  }
}
