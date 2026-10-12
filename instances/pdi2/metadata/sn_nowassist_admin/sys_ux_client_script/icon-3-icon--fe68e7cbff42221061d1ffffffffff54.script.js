/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isFallbackEnabled ? 'info-circle-outline' : 'exclamation-triangle-outline'; 
}
