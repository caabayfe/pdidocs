/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isDonutDataAvailable ? helpers.translateSync('There are no scores available for the selected criteria. Contact your admin for more info.') : '';
}
