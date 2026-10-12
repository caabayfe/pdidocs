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
        type,
        hideActivity
    } = api.state.activityForm.fields;
    const {
        selectedActivityFieldDetails,
        selectedEntity
    } = api.state;
    const {
        STRING,
        JOURNAL_INPUT,
        INTEGER
    } = api.state.INTERNAL_TYPES;
    const {
        EXTERNAL_DATA,
        AGENTIC_AI_DATA
    } = api.state.SOURCE_TYPES;

    if (!selectedEntity || !selectedEntity.source_type) {
        return true;
    }

    // Choose values container should be hidden for textual and input fields except if field is from external data table
    const hideForTextualFields = selectedActivityFieldDetails.internalType === STRING || selectedActivityFieldDetails.internalType === JOURNAL_INPUT || selectedActivityFieldDetails.internalType === INTEGER;

    return (
        selectedEntity.source_type.value === AGENTIC_AI_DATA ||
        selectedEntity.source_type.value === EXTERNAL_DATA ||
        type.selectedValue !== api.state.ACTIVITY_TYPES.DEFAULT ||
        hideActivity.value === true ||
        hideForTextualFields
    );
}
