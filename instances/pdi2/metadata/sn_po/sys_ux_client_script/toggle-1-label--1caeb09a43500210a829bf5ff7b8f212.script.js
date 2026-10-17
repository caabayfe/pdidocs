/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.activityForm.fields.dotWalkMode) {
        const value = api.state.activityForm.fields.dotWalkInput.value.split('.');
        return value[value.length - 1];
    } else {
        return api.state.activityForm.fields.relation.label;
    }
}
