/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.timelineUserPreferences && api.state.timelineUserPreferences.eventGrouping.enabled) {
    return helpers.translateSync('Enabled');
  } else {
    return helpers.translateSync('Disabled');
  }
	
}
