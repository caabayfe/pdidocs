/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.loadingSkippedRecordsWOTestsCount || api.state.loadingSkippedCount
    || ['0', '1'].includes(api.state.upgradePreviewExecTrackerState);
}
