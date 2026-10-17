/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.now_assist_bot_card_util_1.output.showNLUCard && !api.data.now_assist_bot_card_util_1.output.showNowAssistCard;
}
