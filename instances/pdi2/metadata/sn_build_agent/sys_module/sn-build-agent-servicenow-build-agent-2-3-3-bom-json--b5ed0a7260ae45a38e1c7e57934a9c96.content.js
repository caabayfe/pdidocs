{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:9918e85e-eb21-4e50-aa12-6caeaee6a27a",
  "metadata": {
    "timestamp": "2026-10-01T22:57:40.727Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "4.13.0",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "build-agent",
      "group": "@servicenow",
      "version": "2.7.1",
      "bom-ref": "pkg:servicenow/%40servicenow%2Fbuild-agent@2.7.1?sys_scope_id=6805ff49c0eb46ee969d42f0dd56b3bf",
      "description": "Build Agent",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/%40servicenow%2Fbuild-agent@2.7.1?sys_scope_id=6805ff49c0eb46ee969d42f0dd56b3bf",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star3/job/star3/job/groups/job/platform/job/idex-builder-agent/job/project%252Frelease-oct26/13/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/idex-builder-agent.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/%40servicenow%2Fbuild-agent@2.7.1?sys_scope_id=6805ff49c0eb46ee969d42f0dd56b3bf"
    }
  ]
}
