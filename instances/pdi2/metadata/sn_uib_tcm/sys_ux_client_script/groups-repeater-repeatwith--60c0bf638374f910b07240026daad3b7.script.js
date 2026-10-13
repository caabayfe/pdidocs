/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var groupBy = api.state.groupBy;
  if (groupBy == "completion_status") return api.state.commTasksByState;
  else if (groupBy == "communication_plan") return api.state.commTasksByPlan;
}
