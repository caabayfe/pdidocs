/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.updatesCount != null && api.state.newCount != null && (api.state.updatesCount + api.state.newCount === 0))
    return true;
	return ['0', '1','3','4'].includes(api.state.storeExecTrackerState) || api.state.isProcessingClicked || ['0', '1'].includes(api.state.upgradePreviewExecutionTrackerState);  //0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
}
