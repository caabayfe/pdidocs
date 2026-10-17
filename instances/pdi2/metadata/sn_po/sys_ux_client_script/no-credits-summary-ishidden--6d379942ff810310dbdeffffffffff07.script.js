/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const baseUsageAvailable = api.state.projectData.miningSummary?.errorContext?.entitlementNumbers?.baseUsageAvailable;
	if (baseUsageAvailable == null) return true;
	return baseUsageAvailable > 0;
}
