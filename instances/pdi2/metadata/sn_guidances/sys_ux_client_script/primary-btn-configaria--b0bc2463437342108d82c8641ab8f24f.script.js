/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var aria_properties = {"button" : ""};
    const primaryAction = api.state.primaryAction;
    aria_properties['button'] = {"aria-label": primaryAction ? primaryAction.label : ''};
    return aria_properties;
}
