{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:eec98f6a-b465-4e50-9c4b-2297169da92d",
  "metadata": {
    "timestamp": "2026-09-24T11:36:06.928Z",
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
      "name": "servicenow-studio",
      "version": "30.1.3",
      "bom-ref": "pkg:servicenow/servicenow-studio@30.1.3?sys_scope_id=38d42e26f06b4d72f1c7ceee505e96f5",
      "description": "ServiceNow Studio",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/servicenow-studio@30.1.3?sys_scope_id=38d42e26f06b4d72f1c7ceee505e96f5",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/guided-app-creator/job/app-developer-studio/job/master/182/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/app-developer-studio.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/developer-studio",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/servicenow-studio@30.1.3?sys_scope_id=38d42e26f06b4d72f1c7ceee505e96f5"
    }
  ]
}
