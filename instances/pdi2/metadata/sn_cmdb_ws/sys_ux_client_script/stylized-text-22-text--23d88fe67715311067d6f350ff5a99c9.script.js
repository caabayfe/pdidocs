/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.state.attributeLookup[api.item.value] ? api.state.attributeLookup[api.item.value] : "";
}
