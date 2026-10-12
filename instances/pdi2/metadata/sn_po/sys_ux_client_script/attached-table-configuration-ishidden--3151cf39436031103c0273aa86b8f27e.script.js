/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { DEFAULT, DATE_TIME, COMPOUND } = api.state.ACTIVITY_TYPES;
    const {
        type: activityType
    } = api.state.activityForm.fields;
    return (
        activityType.selectedValue &&
        (
            activityType.selectedValue === DEFAULT ||
            activityType.selectedValue === DATE_TIME ||
            activityType.selectedValue === COMPOUND
        )
    );
}
