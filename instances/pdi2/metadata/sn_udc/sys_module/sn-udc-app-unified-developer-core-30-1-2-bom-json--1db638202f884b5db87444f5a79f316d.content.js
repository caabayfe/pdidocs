{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:581e31a5-c527-4cee-acb1-8bea7108fc9a",
  "metadata": {
    "timestamp": "2026-09-23T12:09:46.693Z",
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
      "name": "app-unified-developer-core",
      "version": "30.1.2",
      "bom-ref": "pkg:servicenow/app-unified-developer-core@30.1.2?sys_scope_id=8a841f2bc42f457e8809ea71d35e821f",
      "description": "A core plugin contains app shell, taxonomy model and other common functionalities which can be consumed by any application.",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/app-unified-developer-core@30.1.2?sys_scope_id=8a841f2bc42f457e8809ea71d35e821f",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/app-unified-developer-core/job/master/218/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/app-unified-developer-core.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/app-unified-developer-core",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/app-unified-developer-core@30.1.2?sys_scope_id=8a841f2bc42f457e8809ea71d35e821f"
    }
  ]
}
