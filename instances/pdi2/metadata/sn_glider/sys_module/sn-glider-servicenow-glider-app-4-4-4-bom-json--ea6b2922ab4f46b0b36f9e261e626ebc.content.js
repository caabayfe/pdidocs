{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:13674f32-7bb4-481d-9d26-e22f964dedf5",
  "metadata": {
    "timestamp": "2026-10-01T18:21:00.488Z",
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
      "name": "glider-app",
      "group": "@servicenow",
      "version": "5.1.1",
      "bom-ref": "pkg:servicenow/%40servicenow%2Fglider-app@5.1.1?sys_scope_id=fd254d9443a161100967247e6bb8f200",
      "purl": "pkg:servicenow/%40servicenow%2Fglider-app@5.1.1?sys_scope_id=fd254d9443a161100967247e6bb8f200",
      "externalReferences": [
        {
          "url": "https://build.devsnc.com/teams-star5/job/star5/job/groups/job/glider/job/glider/job/project%252Frelease-oct26/5/",
          "type": "build-system",
          "comment": "As obtained from the environment variable BUILD_URL"
        },
        {
          "url": "git@code.devsnc.com:dev/glider.git",
          "type": "vcs",
          "comment": "As obtained from the environment variable GIT_URL"
        }
      ]
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/%40servicenow%2Fglider-app@5.1.1?sys_scope_id=fd254d9443a161100967247e6bb8f200"
    }
  ]
}
