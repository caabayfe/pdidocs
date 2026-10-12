/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var idx = api.state.poppedContentIndex;
	return api.state.carouselIndexArr[idx];
}
