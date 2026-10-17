/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectedEntity,
        activityForm,
        AGENTIC_API_TABLES,
        SOURCE_TYPES,
        ACTIVITY_TYPES
    } = api.state;

    if (selectedEntity?.source_type?.value === SOURCE_TYPES.AGENTIC_AI_DATA &&
        activityForm.fields.type.selectedValue === ACTIVITY_TYPES.DEFAULT) {
        return AGENTIC_API_TABLES.TASK;
    } else {
        return selectedEntity?.table?.value;
    }

}
