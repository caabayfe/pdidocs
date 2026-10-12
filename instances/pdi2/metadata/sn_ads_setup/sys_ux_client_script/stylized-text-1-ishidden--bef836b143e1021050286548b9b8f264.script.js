/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.state.guidance.title || (api.state.guidance.title && api.state.guidance.title.length === 0);
}
