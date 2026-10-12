/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.projectTemplateDetails.isTemplate) {
    return 'TEMPLATE';
  }
	return 'PROJECT';
}
