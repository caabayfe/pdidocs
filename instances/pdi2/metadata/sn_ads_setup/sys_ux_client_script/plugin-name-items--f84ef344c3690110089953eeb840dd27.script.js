/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    let plugins = api.data.get_plugins_1.output;
    if (!plugins) return;
    plugins = plugins.result ? plugins.result.map(plugin => {
        return {
            "id": plugin.id,
            "sys_id": plugin.sys_id,
            "label": plugin.name,
            "description": plugin.description
        };
    }) : [];

    return plugins;
}
