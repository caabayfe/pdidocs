{
  "$schema": "http://cyclonedx.org/schema/bom-1.6.schema.json",
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "serialNumber": "urn:uuid:f35e6403-8b44-41e7-88be-ed067dc093bb",
  "metadata": {
    "timestamp": "2026-10-13T20:36:03.668Z",
    "tools": {
      "components": [
        {
          "type": "library",
          "name": "sdk-build-plugins",
          "group": "@servicenow",
          "version": "4.13.6",
          "author": "ServiceNow"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "s11-flows",
      "version": "0.0.1",
      "bom-ref": "pkg:servicenow/s11-flows@0.0.1?sys_scope_id=489da54ae67c4a3e9f1e1e4347e9119b",
      "licenses": [
        {
          "license": {
            "name": "UNLICENSED"
          }
        }
      ],
      "purl": "pkg:servicenow/s11-flows@0.0.1?sys_scope_id=489da54ae67c4a3e9f1e1e4347e9119b"
    }
  },
  "components": [],
  "dependencies": [
    {
      "ref": "pkg:servicenow/s11-flows@0.0.1?sys_scope_id=489da54ae67c4a3e9f1e1e4347e9119b"
    }
  ]
}
