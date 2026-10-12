/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const agenticAiSourceSelected = api.state.selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA;
    const allFields = agenticAiSourceSelected ? api.state.aaiTaskChoices : [...api.state.activityForm.fields.relation.listItems];
    const selectedActivityValue = api.state.activityForm.fields.relation.selectedValue;
    if (!selectedActivityValue) {
        return;
    }
    return selectedActivityValue.split(',').map(item => {
        const field = allFields.find(f => f.id === item);
        if (field) {
            return {
                id: item,
                label: field.label,
            };
        }
    });
}
