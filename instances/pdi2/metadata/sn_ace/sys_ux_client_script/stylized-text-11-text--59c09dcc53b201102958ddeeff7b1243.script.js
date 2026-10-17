/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const plugins = api.state.updatePluginList || [];
    return `${api.state.translations["Update"]} (${plugins.length})`;
}
