/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Hide auto-retire if template is true
	return api.state.projectTemplateDetails.isTemplate;
}
