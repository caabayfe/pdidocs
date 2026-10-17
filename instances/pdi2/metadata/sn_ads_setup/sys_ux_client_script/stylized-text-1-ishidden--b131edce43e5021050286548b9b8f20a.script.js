/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.state.setupName || (api.state.setupName && api.state.setupName.length === 0);
}
