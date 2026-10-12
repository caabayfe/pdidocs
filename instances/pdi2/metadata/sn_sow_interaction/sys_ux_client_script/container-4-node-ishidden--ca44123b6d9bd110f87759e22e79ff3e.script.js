/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.get_task_aggregation_query.output && api.state.responseString)
  	return false;
  return true;
}
