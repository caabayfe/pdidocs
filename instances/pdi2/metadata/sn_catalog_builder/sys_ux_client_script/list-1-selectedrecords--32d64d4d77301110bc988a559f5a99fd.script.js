/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api}) {
	if(api.state.selectedTemplateId)
    return [api.state.selectedTemplateId];
  return [];
}
