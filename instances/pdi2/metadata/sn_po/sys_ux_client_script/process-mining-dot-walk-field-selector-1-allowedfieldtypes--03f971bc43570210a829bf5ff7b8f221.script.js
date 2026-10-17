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
        SOURCE_TYPES,
        ACTIVITY_TYPES,
        INTERNAL_TYPES,
        AGENTIC_API_TABLES,
        selectedEntity,
    } = api.state;
    const {
        DEFAULT,
        DATE_TIME
    } = ACTIVITY_TYPES;
    const {
        GLIDE_DATE_TIME,
        REFERENCE,
        STRING,
        INTEGER,
        JOURNAL_INPUT,
    } = INTERNAL_TYPES;
    let internalTypes = Object.values(INTERNAL_TYPES);

    const agenticAiSourceSelected = selectedEntity?.source_type?.value === SOURCE_TYPES.AGENTIC_AI_DATA;

    const activityForm = {
        ...api.state.activityForm
    };
    if (activityForm.fields.type.selectedValue === DEFAULT) {
        internalTypes = internalTypes.filter(f => f !== GLIDE_DATE_TIME);
    } else if (activityForm.fields.type.selectedValue === DATE_TIME) {
        if (agenticAiSourceSelected) {
            internalTypes = internalTypes.filter(f => f === GLIDE_DATE_TIME);
        } else {
            internalTypes = internalTypes.filter(f => f === GLIDE_DATE_TIME || f === REFERENCE);
        }
    }
    return internalTypes;
}
