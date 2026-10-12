/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.invalidJWKSURL)
    return [{ "content": api.state.translatedMessages.invalidURL, "status": "critical", "icon": "circle-info-outline"}];
	return [];
}
