{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:2f77bb97-5d8e-4ed1-b52f-05dbac4dae76",
  "metadata": {
    "timestamp": "2026-06-26T22:48:58.083Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "4.2.0",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "sn_itom_infra_ws",
      "version": "2.0.3",
      "bom-ref": "pkg:servicenow/sn_itom_infra_ws@2.0.3?sys_scope_id=8c941dc748af41de9874de332ec7bb27",
      "description": "ITOM Infra Services Workspace",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/sn_itom_infra_ws@2.0.3?sys_scope_id=8c941dc748af41de9874de332ec7bb27",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star1/job/star1/job/groups/job/itom-infra-workspaces/job/itom-infra-services-workspace/job/master/351/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/itom-infra-services-workspace.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/sn_itom_infra_ws@2.0.3?sys_scope_id=8c941dc748af41de9874de332ec7bb27"
    }
  ]
}
