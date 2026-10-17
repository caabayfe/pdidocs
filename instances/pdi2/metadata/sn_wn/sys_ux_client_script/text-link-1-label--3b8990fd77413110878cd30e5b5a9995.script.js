/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var text = api.state.translatedText;
  if(!text) return '';
	return api.item.value.minimizedText ? text.seeMore : text.seeLess;
}
