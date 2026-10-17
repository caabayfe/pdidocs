/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return (api.state.invalidHour !== null || api.state.invalidMinute !== null || api.state.invalidSecond !== null || api.state.wrongScope);
}
