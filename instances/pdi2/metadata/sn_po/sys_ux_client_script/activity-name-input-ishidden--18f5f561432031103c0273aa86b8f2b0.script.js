/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.activityForm.fields.type.selectedValue !== api.state.ACTIVITY_TYPES.DEFAULT;
}
