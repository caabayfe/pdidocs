/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var errorBannerVisibility = api.state.errorBannerVisibility;
  var index = api.item.index;
	return errorBannerVisibility[index];
}
