/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.template.most_relations_merge_attributes)
    return api.state.template.most_relations_merge_attributes.split(',');

	return [];
  
}
