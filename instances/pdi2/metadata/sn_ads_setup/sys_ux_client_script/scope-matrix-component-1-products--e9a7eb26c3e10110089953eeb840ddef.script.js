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
    plugins = plugins.map(plugin => { 
        return {
            ...plugin,
            label: plugin.name[0] == '\\' ? plugin.name.substr(1) : plugin.name
        };
    });
    return plugins;
}
