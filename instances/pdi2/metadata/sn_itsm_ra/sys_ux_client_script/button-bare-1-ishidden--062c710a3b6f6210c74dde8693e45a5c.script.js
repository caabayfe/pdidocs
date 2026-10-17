/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (!api.state.summarizedText)
		return true;
	return !(api.state.summarizedText.length > 169);
}
