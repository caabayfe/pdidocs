{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:3e96d974-1494-4507-b8fa-926334a49ae1",
  "metadata": {
    "timestamp": "2026-07-21T02:26:31.323Z",
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
      "name": "karuna-glide",
      "version": "1.0.12",
      "bom-ref": "pkg:servicenow/karuna-glide@1.0.12?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1",
      "description": "AI Experience Framework",
      "licenses": [
        {
          "license": {
            "id": "ISC"
          }
        }
      ],
      "purl": "pkg:servicenow/karuna-glide@1.0.12?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star4/job/star4/job/groups/job/employee-experience/job/karuna-glide/job/project%252Freleaseaug26-trueup/10/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/karuna-glide.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/karuna-glide@1.0.12?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1"
    }
  ]
}
