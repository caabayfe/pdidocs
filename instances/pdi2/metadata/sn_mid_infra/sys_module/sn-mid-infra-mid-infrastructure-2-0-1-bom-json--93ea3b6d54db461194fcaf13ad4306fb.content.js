{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:543410ec-5206-407a-8aeb-299bbed8424b",
  "metadata": {
    "timestamp": "2026-06-26T00:44:17.289Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "4.8.0",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "mid-infrastructure",
      "version": "2.0.1",
      "bom-ref": "pkg:servicenow/mid-infrastructure@2.0.1?sys_scope_id=262bfc14e0be488fa62947c413fcf1d0",
      "description": "MID Infrastructure app provides MID infrastructure APIs.",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/mid-infrastructure@2.0.1?sys_scope_id=262bfc14e0be488fa62947c413fcf1d0",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star3/job/star3/job/groups/job/itom/job/mid-infrastructure/job/project%252F2.0.0/53/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/mid-infrastructure.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/mid-infrastructure@2.0.1?sys_scope_id=262bfc14e0be488fa62947c413fcf1d0"
    }
  ]
}
