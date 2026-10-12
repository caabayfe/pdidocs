/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('You are about to mine more than {0} records. Your administrator set this threshold to help you stay aware of high-volume mining. You can start mining or contact your administrator if you have questions.', api.state.meteredUsageLimit.formatted);
}
