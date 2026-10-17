/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.template.merge_relations == 'none')
    return '0';
    
	return 'All';
}
