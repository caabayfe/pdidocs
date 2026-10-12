{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:884e33ef-9a98-4274-a765-387cb378b8a0",
  "metadata": {
    "timestamp": "2026-07-07T21:21:42.161Z",
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
      "version": "1.0.0",
      "bom-ref": "pkg:servicenow/karuna-glide@1.0.0?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1",
      "description": "AI Experience Framework",
      "licenses": [
        {
          "license": {
            "id": "ISC"
          }
        }
      ],
      "purl": "pkg:servicenow/karuna-glide@1.0.0?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1"
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/karuna-glide@1.0.0?sys_scope_id=2a2785427e4c429cb9f7c8a8b475e6f1"
    }
  ]
}
