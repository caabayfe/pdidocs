/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('{0} attributes remain unassigned (these will default to main CI attributes).', api.state.totalAttributesUnassigned);
}
