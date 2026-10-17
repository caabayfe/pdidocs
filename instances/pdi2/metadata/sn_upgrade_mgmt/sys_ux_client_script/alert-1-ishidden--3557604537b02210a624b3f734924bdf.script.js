/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.activityState !== "IN_PROGRESS" || api.state.isPostLane === true)
    return true;
    
  if(api.state.upgradePreviewExecutionTrackerState === "2")
    return api.state.storeExecTrackerState === '2' || api.state.storeExecTrackerState === '3' || api.state.storeExecTrackerState === '4';
  else
    return true;
    // hide loading if store tracker is success, failed or cancelled
}
