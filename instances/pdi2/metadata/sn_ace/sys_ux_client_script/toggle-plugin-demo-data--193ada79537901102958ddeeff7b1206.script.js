/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { name:id, value:checked } = event.payload;
    const plugins = [ ...api.state.plugins ];
    const plugin = plugins.filter(p => p.id === id).pop();
    plugin.install_demo_data = checked;
    api.setState('plugins', plugins);
}
