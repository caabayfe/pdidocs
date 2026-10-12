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
        dotWalkMode,
        dotWalkInput,
        relation,
        name
    } = api.state.activityForm.fields;
    if (!dotWalkMode) {
        return helpers.translateSync('Select list of values for {0}', relation?.label);
    } else if (name?.value) {
        return helpers.translateSync('Select list of values for {0}', name.value);
    } else {
        return helpers.translateSync('Select list of values for {0}', dotWalkInput?.value);
    }
}
