/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.state.relatedItemLookup[api.item.value.related_entry] ? api.state.relatedItemLookup[api.item.value.related_entry] : "";
}
