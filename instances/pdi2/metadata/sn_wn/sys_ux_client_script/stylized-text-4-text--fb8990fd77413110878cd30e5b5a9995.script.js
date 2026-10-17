/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.item.value.minimizedText ? api.item.value.text.substring(0,600) : api.item.value.text;
}
