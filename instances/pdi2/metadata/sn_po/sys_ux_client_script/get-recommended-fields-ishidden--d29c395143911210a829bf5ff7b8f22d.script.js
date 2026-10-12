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
        DEFAULT,
        DATE_TIME,
        PARENT_ATTACHED,
        CHILD_ATTACHED,
        COMPOUND
    } = api.state.ACTIVITY_TYPES;
    const {
        type: activityType
    } = api.state.activityForm.fields;

    const {
        isSnPoAdmin,
        isSnPoPowerUser
    } = api.state.userInfo;

    const { EXTERNAL_DATA, AGENTIC_AI_DATA } = api.state.SOURCE_TYPES;
    
    const sourceType = api.state.selectedEntity?.source_type?.value || '';
  
    return (
        activityType.selectedValue &&
        (
            activityType.selectedValue == PARENT_ATTACHED ||
            activityType.selectedValue == CHILD_ATTACHED ||
            activityType.selectedValue == COMPOUND ||
            activityType.selectedValue == DATE_TIME ||
            sourceType == EXTERNAL_DATA ||
            sourceType == AGENTIC_AI_DATA ||
            (api.state.processId == "" &&!isSnPoAdmin && !isSnPoPowerUser)
        )
    );
}
