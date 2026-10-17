
      {
	"$schema": "http://cyclonedx.org/schema/bom-1.5.schema.json",
	"bomFormat": "CycloneDX",
	"specVersion": "1.5",
	"version": 1,
	"metadata": {
		"timestamp": "2026-08-05T21:43:48.818Z",
		"lifecycles": [
			{
				"phase": "build"
			}
		],
		"tools": [
			{
				"name": "rollup",
				"version": "3.23.0",
				"externalReferences": [
					{
						"url": "git+https://github.com/rollup/rollup.git",
						"type": "vcs",
						"comment": "as detected from PackageJson property \"repository.url\""
					},
					{
						"url": "https://rollupjs.org/",
						"type": "website",
						"comment": "as detected from PackageJson property \"homepage\""
					},
					{
						"url": "https://github.com/rollup/rollup/issues",
						"type": "issue-tracker",
						"comment": "as detected from PackageJson property \"bugs.url\""
					}
				]
			}
		],
		"component": {
			"type": "application",
			"name": "uibtk-api",
			"group": "@devsnc",
			"version": "29.0.37",
			"bom-ref": "pkg:npm/%40devsnc/uibtk-api@29.0.37?vcs_url=https%3A//code.devsnc.com/dev/ui-builder-toolkit",
			"description": "Builder API's scoped metadata records (script includes and endpoints)",
			"purl": "pkg:npm/%40devsnc/uibtk-api@29.0.37?vcs_url=https%3A//code.devsnc.com/dev/ui-builder-toolkit",
			"externalReferences": [
				{
					"url": "https://code.devsnc.com/dev/ui-builder-toolkit",
					"type": "vcs",
					"comment": "as detected from PackageJson property \"repository.url\""
				}
			]
		}
	},
	"components": [
		{
			"type": "library",
			"name": "ux-rules-engine",
			"group": "@devsnc",
			"version": "28.1.18",
			"bom-ref": "pkg:npm/%40devsnc/ux-rules-engine@28.1.18?vcs_url=https%3A//code.devsnc.com/dev/ux-rules-engine.git",
			"description": "A custom ServiceNow application",
			"licenses": [
				{
					"license": {
						"name": "UNLICENSED"
					}
				}
			],
			"purl": "pkg:npm/%40devsnc/ux-rules-engine@28.1.18?vcs_url=https%3A//code.devsnc.com/dev/ux-rules-engine.git",
			"externalReferences": [
				{
					"url": "https://code.devsnc.com/dev/ux-rules-engine.git",
					"type": "vcs",
					"comment": "as detected from PackageJson property \"repository.url\""
				}
			]
		},
		{
			"type": "library",
			"name": "rollup-plugin-node-polyfills",
			"version": "0.2.1",
			"bom-ref": "pkg:npm/rollup-plugin-node-polyfills@0.2.1?vcs_url=git%2Bssh%3A//git%40github.com/ionic-team/rollup-plugin-node-polyfills.git",
			"licenses": [
				{
					"license": {
						"id": "MIT"
					}
				}
			],
			"purl": "pkg:npm/rollup-plugin-node-polyfills@0.2.1?vcs_url=git%2Bssh%3A//git%40github.com/ionic-team/rollup-plugin-node-polyfills.git",
			"externalReferences": [
				{
					"url": "git+ssh://git@github.com/ionic-team/rollup-plugin-node-polyfills.git",
					"type": "vcs",
					"comment": "as detected from PackageJson property \"repository.url\""
				},
				{
					"url": "https://github.com/ionic-team/rollup-plugin-node-polyfills#readme",
					"type": "website",
					"comment": "as detected from PackageJson property \"homepage\""
				},
				{
					"url": "https://github.com/ionic-team/rollup-plugin-node-polyfills/issues",
					"type": "issue-tracker",
					"comment": "as detected from PackageJson property \"bugs.url\""
				}
			]
		}
	],
	"dependencies": [
		{
			"ref": "pkg:npm/%40devsnc/uibtk-api@29.0.37?vcs_url=https%3A//code.devsnc.com/dev/ui-builder-toolkit"
		},
		{
			"ref": "pkg:npm/%40devsnc/ux-rules-engine@28.1.18?vcs_url=https%3A//code.devsnc.com/dev/ux-rules-engine.git"
		},
		{
			"ref": "pkg:npm/rollup-plugin-node-polyfills@0.2.1?vcs_url=git%2Bssh%3A//git%40github.com/ionic-team/rollup-plugin-node-polyfills.git"
		}
	]
}
