/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    "label": helpers.translateSync("Execution tracker"),
    "href": "/sys_execution_tracker.do?sys_id=" + api.state.executionTrackerId
  };
}
