/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api.state.selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA && 
  api.state.activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DEFAULT);
}
