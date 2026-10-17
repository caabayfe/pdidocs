/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var provider = api.item.value.provider;
	return api.data.languages_enabled_for_native_translation?.output[provider]?.languages?.id.length || 0;
}
