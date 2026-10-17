{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:286835a5-dcfb-4b8d-ab06-c42d6b69abd2",
  "metadata": {
    "timestamp": "2026-09-15T01:18:32.802Z",
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
      "name": "sn-ip-survey",
      "group": "@servicenow",
      "version": "29.0.4",
      "bom-ref": "pkg:servicenow/%40servicenow%2Fsn-ip-survey@29.0.4?sys_scope_id=1078638e2c801ad551c40674ed1a36b0",
      "description": "In-Product Survey - Seismic bridge component and REST telemetry endpoint for IPS",
      "purl": "pkg:servicenow/%40servicenow%2Fsn-ip-survey@29.0.4?sys_scope_id=1078638e2c801ad551c40674ed1a36b0",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star5/job/star5/job/groups/job/uxf/job/in-product-survey/job/australia/15/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/in-product-survey.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        },
        {
          "url": "https://code.devsnc.com/dev/in-product-survey",
          "type": "vcs",
          "comment": "as detected from PackageJson property \"repository.url\""
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/%40servicenow%2Fsn-ip-survey@29.0.4?sys_scope_id=1078638e2c801ad551c40674ed1a36b0"
    }
  ]
}
