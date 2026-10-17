{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:ec8376f3-9b9d-4dcc-b79b-b4e60e49c754",
  "metadata": {
    "timestamp": "2026-10-06T16:49:53.565Z",
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
      "name": "error-framework",
      "version": "1.0.0",
      "bom-ref": "pkg:servicenow/error-framework@1.0.0?sys_scope_id=global",
      "author": "now.itom_cee",
      "description": "Error Framework",
      "purl": "pkg:servicenow/error-framework@1.0.0?sys_scope_id=global",
      "externalReferences": [
        {
          "url": "https://build-glide.devsnc.com/build-glide-release1/job/build-glide-release1/job/release-glide-australia-patch7/9/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "ssh://code.devsnc.com/dev",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/error-framework@1.0.0?sys_scope_id=global"
    }
  ]
}
