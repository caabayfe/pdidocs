/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.data.look_up_exec_tracker_status.results && api.data.look_up_exec_tracker_status.results.length > 0 && ['3','4'].includes(api.data.look_up_exec_tracker_status.results[0].state.value)) {
    return 'error';
  } else {
    return 'initial';
  }
}
