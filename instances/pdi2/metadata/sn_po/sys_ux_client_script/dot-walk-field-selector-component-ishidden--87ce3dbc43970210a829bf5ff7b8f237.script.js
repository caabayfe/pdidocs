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
        ACTIVITY_TYPES: {
            DEFAULT,
            PARENT_ATTACHED,
            CHILD_ATTACHED,
            COMPOUND
        },
        SOURCE_TYPES: {
            AGENTIC_AI_DATA
        },
        selectedEntity,
        activityForm,
        projectPermissions,
        projectDetails
    } = api.state;

        const {
        type: activityType,
    } = activityForm.fields;

    if (selectedEntity?.source_type?.value === AGENTIC_AI_DATA &&
        activityType.selectedValue === DEFAULT) {
        return true;
    }

    const canAccess = !projectPermissions.promin_activity_def.canWrite || projectDetails.ismining;

    return (
        activityType.selectedValue &&
        (
            activityType.selectedValue === PARENT_ATTACHED ||
            activityType.selectedValue === CHILD_ATTACHED ||
            activityType.selectedValue === COMPOUND ||
            canAccess
        )
    );
}
