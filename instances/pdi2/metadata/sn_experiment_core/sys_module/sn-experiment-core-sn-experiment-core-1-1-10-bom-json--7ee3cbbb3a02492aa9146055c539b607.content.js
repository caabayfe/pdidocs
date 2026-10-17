{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:09a5204d-fed0-437f-b0e7-a63eb4149332",
  "metadata": {
    "timestamp": "2026-05-21T12:50:16.577Z",
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
      "name": "sn_experiment_core",
      "version": "1.1.10",
      "bom-ref": "pkg:servicenow/sn_experiment_core@1.1.10?sys_scope_id=fa5da291ffb32210ff52ffffffffff42",
      "licenses": [
        {
          "license": {
            "id": "ISC"
          }
        }
      ],
      "purl": "pkg:servicenow/sn_experiment_core@1.1.10?sys_scope_id=fa5da291ffb32210ff52ffffffffff42",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star1/job/star1/job/groups/job/experimentation/job/experimentation-framework/job/project%252Fdev/6/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/experimentation-framework.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/sn_experiment_core@1.1.10?sys_scope_id=fa5da291ffb32210ff52ffffffffff42"
    }
  ]
}
