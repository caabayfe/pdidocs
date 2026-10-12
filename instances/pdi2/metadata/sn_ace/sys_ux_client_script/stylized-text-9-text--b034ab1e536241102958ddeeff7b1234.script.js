/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const plugins = api.state.plugins || [];
    const plugin = plugins[0] || {};
    return `${api.state.translations["Updating to"]}: ${plugin.newerVersion}`;
}
