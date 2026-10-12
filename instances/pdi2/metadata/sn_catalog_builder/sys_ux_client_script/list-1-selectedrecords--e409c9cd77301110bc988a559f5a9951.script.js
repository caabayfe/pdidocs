/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api}) {
	if (api.state.recordID)
		return [api.state.recordID];
	return [];
}
