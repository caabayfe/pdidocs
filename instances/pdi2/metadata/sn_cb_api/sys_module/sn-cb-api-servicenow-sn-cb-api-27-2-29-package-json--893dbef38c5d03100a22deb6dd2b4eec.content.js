{
	"name": "@servicenow/sn-cb-api",
	"version": "27.2.29",
	"private": false,
	"description": "Components Builder APIs",
	"keywords": [
		"ServiceNow",
		"Seismic Component",
		"sn-cb-api"
	],
	"scripts": {
		"build": "rm -rf target && now-sdk build && tectonic pack",
		"ci:build": "rm -rf target && now-sdk build && tectonic pack",
		"deploy": "./../.bin/deploy",
		"postdeploy": "git restore ./src/plugin-xmls/scope/sys_app_58d65e5a729340ac35dc8fd71d665545.xml",
		"test": "tectonic test unit"
	},
	"repository": {
		"type": "git",
		"url": "https://code.devsnc.com/dev/components-builder"
	},
	"now": {
		"scope": "sn_cb_api",
		"scopeId": "58d65e5a729340ac35dc8fd71d665545",
		"metadataDir": "src/plugin-xmls",
		"packOutputDir": "dist/target"
	},
	"module": "index.js",
	"engines": {
		"node": ">=22.5.1",
		"pnpm": ">=9.10.0"
	},
	"exports": {
		".": "./src/server/index.js"
	},
	"dependencies": {
		"@servicenow/glide": "25.0.2"
	},
	"devDependencies": {
		"@servicenow/sdk": "1.1.0-rc1",
		"mem-fs-editor": "9.0.2",
		"xml2js": "0.6.2"
	}
}
