/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  try{
	  if (api.data.look_up_exec_tracker_status.results && ['3','4'].includes(api.data.look_up_exec_tracker_status.results[0].state.value)) {
      return `Compatibility Check Failed`;
    } else {
      let message = api.data.look_up_exec_tracker_status.results[0].message.value;
      let percentage = api.data.look_up_exec_tracker_status.results[0].percent_complete.value;
      return `${message} (${percentage}%)`;
    }
  }catch(e){
    return `Compatibility Check Failed`;
  }
}
