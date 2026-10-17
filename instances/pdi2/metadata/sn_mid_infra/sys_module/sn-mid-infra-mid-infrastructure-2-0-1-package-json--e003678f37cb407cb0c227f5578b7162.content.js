{
  "name": "mid-infrastructure",
  "version": "2.0.1",
  "description": "MID Infrastructure app provides MID infrastructure APIs.",
  "license": "UNLICENSED",
  "scripts": {
    "build": "now-sdk build --emitDictionary=false",
    "fix-metadata": "node -e \"const fs=require('fs');const p='target/com.sn_mid_infra';fs.mkdirSync(p,{recursive:true});const xml=`<plugin>\\n  <name>MID Infrastructure</name>\\n  <description>MID Infrastructure app provides MID infrastructure APIs.</description>\\n  <scope>sn_mid_infra</scope>\\n  <scope_sys_id>262bfc14e0be488fa62947c413fcf1d0</scope_sys_id>\\n</plugin>\\n`;fs.writeFileSync(p+'/plugin.xml',xml);console.log('Wrote',p+'/plugin.xml');\"",
    "deploy": "now-sdk install",
    "transform": "now-sdk transform",
    "types": "now-sdk dependencies",
    "extract": "nu extract",
    "cov": "nu mocha -m ci --",
    "unit": "npm run extract && npm run cov",
    "test": "npm run unit",
    "coverage:html": "nyc report --reporter=html --report-dir coverage",
    "clean:coverage": "rm -rf coverage .nyc_output",
    "clean": "rm -rf dist coverage docs release",
    "clean:all": "rm -rf dist target coverage .nyc_output docs release .jest_cache scripts node",
    "docs": "typedoc --options typedoc.json",
    "docs:layout": "node scripts/regen-source-layout.mjs",
    "ci:build": "npm ci && now-sdk build --emitDictionary=false"
  },
  "devDependencies": {
    "@servicenow/eslint-plugin-sdk-app-plugin": "4.8.0",
    "@servicenow/glide": "^26.0.1",
    "@servicenow/grit": "^3.1.0",
    "@servicenow/commons-test-js-utils": "^2.0.3",
    "@servicenow/sdk": "^4.8.0",
    "@servicenow/sdk-cli": "4.8.0",
    "eslint": "9.35.0",
    "graceful-fs": "^4.2.11",
    "ts-node": "^10.9.2",
    "typedoc": "^0.25.13",
    "now-unit": "^3.2.0",
    "chai": "^4.4.1",
    "sinon": "^17.0.1",
    "sinon-chai": "^3.7.0",
    "@babel/core": "^7.25.0",
    "@babel/preset-env": "^7.25.0",
    "@babel/register": "^7.25.0",
    "babel-plugin-module-resolver": "^5.0.0",
    "fast-xml-parser": "5.2.5"
  },
  "nyc": {
    "reporter": [
      "text",
      "lcov",
      "html"
    ],
    "report-dir": "coverage"
  }
}
