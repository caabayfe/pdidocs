{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:b86b2244-746e-4d2c-b099-5d6d9328c580",
  "metadata": {
    "timestamp": "2026-09-23T18:18:02.119Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "0.0.1",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "sn-table-builder",
      "group": "@devsnc",
      "version": "30.1.1",
      "bom-ref": "pkg:servicenow/%40devsnc%2Fsn-table-builder@30.1.1?sys_scope_id=f53f19bac362fa22ca2e93692d32f18f",
      "description": "Low code interface for building ServiceNow tables",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/%40devsnc%2Fsn-table-builder@30.1.1?sys_scope_id=f53f19bac362fa22ca2e93692d32f18f",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/table-builder/job/master/325/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/table-builder.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/table-builder",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/%40devsnc%2Fsn-table-builder@30.1.1?sys_scope_id=f53f19bac362fa22ca2e93692d32f18f"
    }
  ]
}
