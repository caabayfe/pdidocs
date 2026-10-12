/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const count = api.state.template.oldest_created_merge_attributes ? api.state.template.oldest_created_merge_attributes.split(',').length : 0;
  return count + " / " + api.state.totalAttributes;
}
