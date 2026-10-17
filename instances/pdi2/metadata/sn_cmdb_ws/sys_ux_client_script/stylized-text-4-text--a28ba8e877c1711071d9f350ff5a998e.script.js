/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  let count = api.state.template.newest_updated_merge_attributes ? api.state.template.newest_updated_merge_attributes.split(',').length : 0;
	return count + " / " + api.state.totalAttributes;
 
}
