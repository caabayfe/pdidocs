/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var isProcActive = api.data.proc_plugin_status.output.active;
    api.setState('hidePODWidget', !isProcActive);
}
