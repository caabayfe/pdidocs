/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !['0', '1'].includes(api.state.upgradePreviewExecutionTrackerState);//0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
}
