/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.state.setupDescription || (api.state.setupDescription && api.state.setupDescription.length === 0);
}
