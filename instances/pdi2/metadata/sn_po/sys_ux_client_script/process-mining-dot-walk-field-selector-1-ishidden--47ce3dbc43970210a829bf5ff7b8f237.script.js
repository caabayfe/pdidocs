/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { PARENT_ATTACHED, CHILD_ATTACHED, COMPOUND } = api.state.ACTIVITY_TYPES;
    const {
        type: activityType,
    } = api.state.activityForm.fields;
    return (
        activityType.selectedValue &&
        (
            activityType.selectedValue === PARENT_ATTACHED ||
            activityType.selectedValue === CHILD_ATTACHED ||
            activityType.selectedValue === COMPOUND
        )
    );
}
