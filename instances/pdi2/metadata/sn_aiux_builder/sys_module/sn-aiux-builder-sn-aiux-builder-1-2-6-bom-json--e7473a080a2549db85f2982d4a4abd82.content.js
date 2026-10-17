{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:37f04e03-2071-4d2a-903d-36455291a4e2",
  "metadata": {
    "timestamp": "2026-07-24T18:39:24.461Z",
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
      "name": "sn-aiux-builder",
      "version": "1.2.6",
      "bom-ref": "pkg:servicenow/sn-aiux-builder@1.2.6?sys_scope_id=c52da889a5e702011878b2d9c306a5a6",
      "description": "SN AIUX Builder - Widget creation and playground experience for ServiceNow AIX",
      "licenses": [
        {
          "license": {
            "id": "ISC"
          }
        }
      ],
      "purl": "pkg:servicenow/sn-aiux-builder@1.2.6?sys_scope_id=c52da889a5e702011878b2d9c306a5a6",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/employee-experience/job/sn-aiux-builder/job/project%252Frelease-july26-trueup/27/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/sn-aiux-builder.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/sn-aiux-builder@1.2.6?sys_scope_id=c52da889a5e702011878b2d9c306a5a6"
    }
  ]
}
