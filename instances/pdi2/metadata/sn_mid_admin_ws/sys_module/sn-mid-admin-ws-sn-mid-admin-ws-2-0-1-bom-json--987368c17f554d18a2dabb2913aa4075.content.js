{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:f794b1bc-2163-4d33-b53c-bd86391779e7",
  "metadata": {
    "timestamp": "2026-06-24T03:21:46.815Z",
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
      "name": "sn_mid_admin_ws",
      "version": "2.0.1",
      "bom-ref": "pkg:servicenow/sn_mid_admin_ws@2.0.1?sys_scope_id=2e77d2ecf523ee54f877e8fd7f61853f",
      "description": "MID Admin Workspace",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/sn_mid_admin_ws@2.0.1?sys_scope_id=2e77d2ecf523ee54f877e8fd7f61853f",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star1/job/star1/job/groups/job/itom-infra-workspaces/job/mid-admin-workspace/job/master/221/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/mid-admin-workspace.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/sn_mid_admin_ws@2.0.1?sys_scope_id=2e77d2ecf523ee54f877e8fd7f61853f"
    }
  ]
}
