/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var atleast_one_selection_made = api.state.agent_to_requestor || api.state.requestor_to_agent || api.state.requestor_to_virtual_agent;
  
  return !atleast_one_selection_made;
}
