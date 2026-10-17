/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.loadingSkippedCount || api.state.loadingSkippedRecordsWOTestsCount
    || ['0', '1'].includes(api.state.upgradePreviewExecTrackerState);
}
