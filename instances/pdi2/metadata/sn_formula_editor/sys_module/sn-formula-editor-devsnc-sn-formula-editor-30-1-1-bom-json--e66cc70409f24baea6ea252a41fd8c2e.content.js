{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:afb97e63-7ca8-4a52-bffa-c37e87e21719",
  "metadata": {
    "timestamp": "2026-09-23T11:35:37.251Z",
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
      "name": "sn-formula-editor",
      "group": "@devsnc",
      "version": "30.1.1",
      "bom-ref": "pkg:servicenow/%40devsnc%2Fsn-formula-editor@30.1.1?sys_scope_id=addb5158e153e171e15ab8a283104d4c",
      "description": "A simple, no-code tool to write formulas when building tables in custom applications - update",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/%40devsnc%2Fsn-formula-editor@30.1.1?sys_scope_id=addb5158e153e171e15ab8a283104d4c",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/sn-formula-editor/job/master/157/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/sn-formula-editor.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/devsnc-sn-formula-editor",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/%40devsnc%2Fsn-formula-editor@30.1.1?sys_scope_id=addb5158e153e171e15ab8a283104d4c"
    }
  ]
}
