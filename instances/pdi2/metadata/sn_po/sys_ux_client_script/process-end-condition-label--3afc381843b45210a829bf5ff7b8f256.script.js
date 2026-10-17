/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.advancedConditionForm.fields.transitionConditionType == 'TRANSITION' ? helpers.translateSync('Step 2') : helpers.translateSync('End condition');
}
