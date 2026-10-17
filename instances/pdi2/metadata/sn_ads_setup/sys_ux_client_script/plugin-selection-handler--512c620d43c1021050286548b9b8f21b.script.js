/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const installPlugins = [...api.state.installPlugins];
    if (event.payload.value) {
        installPlugins.push({
            ...event.payload.plugin
        });
    } else {
        const selectedPluginIndex = installPlugins.findIndex(plugin => plugin.sys_id === event.payload.plugin.sys_id);
        installPlugins.splice(selectedPluginIndex, 1);
    }
    api.setState('installPlugins', installPlugins);
}
