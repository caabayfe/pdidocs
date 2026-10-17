/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const count = api.state.template.most_related_items_merge_attributes ? api.state.template.most_related_items_merge_attributes.split(',').length : 0;
  return count + " / " + api.state.totalAttributes;
}
