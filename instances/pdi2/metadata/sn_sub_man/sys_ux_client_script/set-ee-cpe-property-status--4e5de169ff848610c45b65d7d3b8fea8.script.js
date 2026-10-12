/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const result = api.data.ee_cpe_data_display_status.result.value.value == 'true';
    api.setState('ee_cpe_data_display_status', result);
}
