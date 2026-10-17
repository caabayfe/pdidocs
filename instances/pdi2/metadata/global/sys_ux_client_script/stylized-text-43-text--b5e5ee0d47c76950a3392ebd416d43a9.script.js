/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('of {0} incidents are predicted to match intents that have active topics', api.state.totalRecordCount);
}
