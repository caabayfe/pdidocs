/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.advancedConditionForm.fields.transitionConditionType == 'TRANSITION' ? helpers.translateSync('Step 1') : helpers.translateSync('Start condition');
}
