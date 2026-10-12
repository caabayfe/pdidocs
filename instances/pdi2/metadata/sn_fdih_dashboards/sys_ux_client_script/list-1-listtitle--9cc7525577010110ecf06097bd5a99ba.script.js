/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.show_only_long_running_flows)
	  return helpers.translateSync('Long Running Flow Executions');
  return helpers.translateSync('Flow Executions');
}
