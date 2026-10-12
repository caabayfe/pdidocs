/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.upgradePreviewExecTrackerState !== '2'; //0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
}
