{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:d8b3ca5b-6f79-46f1-b013-87b67416788e",
  "metadata": {
    "timestamp": "2026-09-10T18:28:05.244Z",
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
      "version": "1.1.20",
      "bom-ref": "pkg:servicenow/sn_experiment_core@1.1.20?sys_scope_id=fa5da291ffb32210ff52ffffffffff42",
      "licenses": [
        {
          "license": {
            "id": "ISC"
          }
        }
      ],
      "purl": "pkg:servicenow/sn_experiment_core@1.1.20?sys_scope_id=fa5da291ffb32210ff52ffffffffff42",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star1/job/star1/job/groups/job/experimentation/job/experimentation-framework/job/project%252Fdev/46/",
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
      "ref": "pkg:servicenow/sn_experiment_core@1.1.20?sys_scope_id=fa5da291ffb32210ff52ffffffffff42"
    }
  ]
}
