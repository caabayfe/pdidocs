/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var instances = api.state.instances;
    return !instances || instances.filter(i => i.checked).length === 0;
}
