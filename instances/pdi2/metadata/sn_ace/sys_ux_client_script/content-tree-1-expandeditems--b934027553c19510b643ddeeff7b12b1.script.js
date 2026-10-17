/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.contentBlocksHierarchy.length > 0 ? [[api.state.contentBlocksHierarchy[0].id]] : '';
}
