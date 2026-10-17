/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.timelineUserPreferences)
	return [api.state.timelineUserPreferences.dateTimeFormat];
}
