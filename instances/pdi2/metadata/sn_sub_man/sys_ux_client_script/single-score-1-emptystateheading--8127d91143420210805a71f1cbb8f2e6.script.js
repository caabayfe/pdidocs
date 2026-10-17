/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isDonutDataAvailable ? helpers.translateSync('No data available.') : helpers.translateSync('Loading visualization data');
}
