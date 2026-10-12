/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.state.guidance.description || (api.state.guidance.description && api.state.guidance.description.length === 0);
}
