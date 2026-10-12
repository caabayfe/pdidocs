/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.selectedRecommendedctivity && Boolean(Object.keys(api.state.selectedRecommendedctivity)?.length == 0);
}
