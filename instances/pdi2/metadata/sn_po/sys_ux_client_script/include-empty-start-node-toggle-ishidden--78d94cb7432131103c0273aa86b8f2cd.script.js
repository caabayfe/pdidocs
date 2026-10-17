/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const activityFormFields = { 
      ...api.state.activityForm.fields
    };
    const agenticAiSourceSelected = api.state.selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA;

    return agenticAiSourceSelected || activityFormFields.type.selectedValue !== api.state.ACTIVITY_TYPES.DEFAULT;
}
