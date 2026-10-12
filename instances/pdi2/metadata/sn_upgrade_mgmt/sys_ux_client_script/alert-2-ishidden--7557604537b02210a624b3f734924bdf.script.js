/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // hide if running, pending or succeeded
  return api.state.storeExecTrackerState === "0" || api.state.storeExecTrackerState === "1" || api.state.storeExecTrackerState === "2";
}
