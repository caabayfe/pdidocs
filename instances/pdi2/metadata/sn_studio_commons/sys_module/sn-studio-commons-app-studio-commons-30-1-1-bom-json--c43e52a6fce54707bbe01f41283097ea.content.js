{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:cf81bba7-ee6a-47e6-b1cb-3f567d06e7f2",
  "metadata": {
    "timestamp": "2026-09-23T12:54:22.488Z",
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
      "name": "app-studio-commons",
      "version": "30.1.1",
      "bom-ref": "pkg:servicenow/app-studio-commons@30.1.1?sys_scope_id=50c45c69e0089cfa57aa73a642c702c7",
      "description": "A core plugin contains shareable UI components, UX Application and UX pages, that can be used by studios (Developer Studio, Creator Studio, etc.) and Unified Developer Appshell.",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/app-studio-commons@30.1.1?sys_scope_id=50c45c69e0089cfa57aa73a642c702c7",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/app-studio-commons/job/master/151/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/app-studio-commons.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/app-studio-commons",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/app-studio-commons@30.1.1?sys_scope_id=50c45c69e0089cfa57aa73a642c702c7"
    }
  ]
}
