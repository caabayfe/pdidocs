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
        groupValues
    } = api.state.activityForm.fields;

    if (groupValues.value === 'group-unique-values') {
        return true;
    }

    return false;
}
