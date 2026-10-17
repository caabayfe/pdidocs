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
		return helpers.translateSync('Please activate the Standard template to create a merge article.');
	}
	return helpers.translateSync('Activate an article template to create an article.');
}
