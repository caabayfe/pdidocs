/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.cicdResponse && Object.keys(api.state.cicdResponse).length || !api.state.installPlugins.length;
}
