/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isProcessing || api.state.performingAction || api.state.activityState !== "IN_PROGRESS";
}
