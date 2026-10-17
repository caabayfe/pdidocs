/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return (api.state.isTimelineSettingsEditModeOn ||!api.state.accessPermission.canEditTimeline || (api.state.timelineUserPreferences && JSON.stringify(api.data.fetch_pir_timeline_settings.output.settings) != JSON.stringify(api.state.timelineUserPreferences)));
}
