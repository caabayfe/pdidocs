{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:06b0a487-64fd-4ef9-8dd6-5c98f7032557",
  "metadata": {
    "timestamp": "2026-09-23T07:37:27.269Z",
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
      "name": "knowledge-center-aiux",
      "version": "0.1.0",
      "bom-ref": "pkg:servicenow/knowledge-center-aiux@0.1.0?sys_scope_id=48e5dbcb9f6f1210ecf142a4ba0a1c84",
      "description": "AIUX — Knowledge Center",
      "purl": "pkg:servicenow/knowledge-center-aiux@0.1.0?sys_scope_id=48e5dbcb9f6f1210ecf142a4ba0a1c84",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star2/job/star2/job/groups/job/csm/job/app-knowledge-center/job/project%252Foct-2026/79/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/app-knowledge-center.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/knowledge-center-aiux@0.1.0?sys_scope_id=48e5dbcb9f6f1210ecf142a4ba0a1c84"
    }
  ]
}
