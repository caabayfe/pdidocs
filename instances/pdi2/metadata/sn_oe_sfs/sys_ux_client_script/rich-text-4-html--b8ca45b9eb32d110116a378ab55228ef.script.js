/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return '<b>' + api.data.sso_status_1.output.tenantName + '</b>';
}
