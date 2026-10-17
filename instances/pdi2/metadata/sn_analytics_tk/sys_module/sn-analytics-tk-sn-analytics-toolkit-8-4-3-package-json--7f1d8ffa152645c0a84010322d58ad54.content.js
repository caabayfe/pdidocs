{
  "name": "sn-analytics-toolkit",
  "version": "8.4.3",
  "description": "",
  "license": "UNLICENSED",
  "scripts": {
    "build": "pnpm run build:sdk && pnpm run build:library",
    "build:library": "tectonic pack",
    "build:sdk": "tsc -b && now-sdk build",
    "deploy": "now-sdk install",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "test": "tectonic test unit"
  },
  "module": "./src/index.ts",
  "devDependencies": {
    "@babel/runtime": "^7.27.1",
    "@servicenow/glide": "26.0.1",
    "@servicenow/sdk": "4.0.0-alpha.26",
    "@tectonic/jest-sdlc-reporter": "29.4.0",
    "@tectonic/test-api": "29.4.0",
    "@types/jest": "^30.0.0",
    "eslint": "8.50.0",
    "typescript": "5.5.4"
  },
  "dependencies": {
    "zod": "4.3.5"
  }
}
