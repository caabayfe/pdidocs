/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

	return api?.state?.scopeTypeSelection == 'instanceLevel' ? helpers.translateSync('Select your default LLM Provider') : helpers.translateSync("Select your skills or functions to review impact") 
}
