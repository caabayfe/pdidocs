/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let plugins = api.state.plugins;
    return plugins.some(plugin => plugin.isQEChecked || plugin.isBEChecked) ? 'Configured at individual plugin level' : 'All plugins in Custom';
}
