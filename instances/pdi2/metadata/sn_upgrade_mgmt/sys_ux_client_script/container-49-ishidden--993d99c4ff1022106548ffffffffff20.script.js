/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api?.state?.releasedCardsRepeaterData?.length <= 0 && api.state.completeCard.show ) || api.state.loading;
}
