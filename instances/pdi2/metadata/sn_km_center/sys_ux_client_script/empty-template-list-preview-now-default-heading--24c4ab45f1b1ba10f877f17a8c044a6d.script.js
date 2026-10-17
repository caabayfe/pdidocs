/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Check if this is a duplicate merge scenario with Standard template error
	const params = api.state?.interceptorExtraParams;
	const isStandardTemplateError = api.state?.showStandardTemplateError;
	
	if (params?.sourcePage === "duplicatesMerge" && isStandardTemplateError) {
		return {
			"label": helpers.translateSync('Standard template required')
		};
	}
	return {
	"label": helpers.translateSync('No article template is active.')
};
}
