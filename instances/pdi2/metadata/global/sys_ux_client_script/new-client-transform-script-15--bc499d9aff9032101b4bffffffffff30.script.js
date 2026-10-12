/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (!api.state.pageLoaded)
		return true;
	return api.state.models.chgModels.length === 0;
}
