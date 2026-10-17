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
        INTERNAL_TYPES: {
            STRING,
            INTEGER
        },
        SOURCE_TYPES,
        selectedEntity,
        activityForm,
        aaiTaskChoices
    } = api.state;
    const agenticAiSourceSelected = selectedEntity?.source_type?.value === SOURCE_TYPES.AGENTIC_AI_DATA;

    return agenticAiSourceSelected ? aaiTaskChoices : activityForm.fields.relation.listItems.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });

}
