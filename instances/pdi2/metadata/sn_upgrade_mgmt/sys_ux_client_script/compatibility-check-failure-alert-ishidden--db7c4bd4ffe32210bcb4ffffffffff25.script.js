/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	 return !(api.data.look_up_exec_tracker_status.results && api.data.look_up_exec_tracker_status.results.length > 0 && ['3','4'].includes(api.data.look_up_exec_tracker_status.results[0].state.value)); // 0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
}
