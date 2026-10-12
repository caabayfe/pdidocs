/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.entityForm.fields?.slaBreachAnalysis?.visible == 'true') {
        return false
    } else {
        return true;
    }
}
