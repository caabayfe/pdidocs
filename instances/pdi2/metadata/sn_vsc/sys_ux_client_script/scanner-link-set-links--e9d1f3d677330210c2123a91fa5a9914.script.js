/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	 return [{
        "type": "external",
        "label": "View all results",
        "value": {
            "href": "/now/security-center-configuration/security_scan_results"
        },
        "opensWindow": true,
        "download": false
    }];
}
