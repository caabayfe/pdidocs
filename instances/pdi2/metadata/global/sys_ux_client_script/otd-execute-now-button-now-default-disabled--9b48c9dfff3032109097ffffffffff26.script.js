/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const state = api.data.load_rule_details_child.output?.rule?.state;
  const executeEnabled = ["new", "scheduled"].includes(state);
  if(!executeEnabled) return true;
  return api.state["executeOTDDisabled"];
}
