/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var modules = api.context.props.modules;
    for (var i = 0; i <= modules.length; i++) {
        if (modules[i] && modules[i].isActive == true)
            return i;
    }
    return 0;
}
