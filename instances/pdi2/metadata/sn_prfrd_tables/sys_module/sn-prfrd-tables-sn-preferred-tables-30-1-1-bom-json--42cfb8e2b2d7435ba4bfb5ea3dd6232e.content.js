{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:1aaff9bc-748a-4542-8dd0-4585914a0a8c",
  "metadata": {
    "timestamp": "2026-09-23T11:15:47.336Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "4.11.2",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "sn-preferred-tables",
      "version": "30.1.1",
      "bom-ref": "pkg:servicenow/sn-preferred-tables@30.1.1?sys_scope_id=de7c09b877e2111031e3b3c64b5a994a",
      "description": "Global Preferred tables list",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/sn-preferred-tables@30.1.1?sys_scope_id=de7c09b877e2111031e3b3c64b5a994a",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/sn-preferred-tables/job/master/104/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/sn-preferred-tables.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/sn-preferred-tables@30.1.1?sys_scope_id=de7c09b877e2111031e3b3c64b5a994a"
    }
  ]
}
