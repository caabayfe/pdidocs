/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.data?.get_top_security_center_insights?.output?.totalTopInsights > 0;
}
