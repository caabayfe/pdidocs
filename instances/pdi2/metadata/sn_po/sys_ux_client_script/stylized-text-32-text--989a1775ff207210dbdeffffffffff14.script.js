/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('Mining over {0} records can increase license usage. Records mined earlier are not counted again.', api.state.meteredUsageLimit.formatted);
}
