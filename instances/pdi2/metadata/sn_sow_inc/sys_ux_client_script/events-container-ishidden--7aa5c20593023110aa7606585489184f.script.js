/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.timelineUserPreferences && !api.state.timelineUserPreferences.showHiddenEventsInEditView && api.item.value.isHidden;
}
