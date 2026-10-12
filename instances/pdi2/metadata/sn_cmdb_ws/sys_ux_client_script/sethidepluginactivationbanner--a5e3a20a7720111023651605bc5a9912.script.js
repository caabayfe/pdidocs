/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(!api.data.itom_discovery_plugin_status.output.active) {
        api.setState("hidePluginActivationBanner",false);
    }
}
