/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.fieldName === 'name') {
        api.setState('name', event.payload.value);
    }
    else if (event.payload.fieldName === 'auto_res_config') {
        api.setState('arConfig', event.payload.value);
    }
    else if (event.payload.fieldName === 'record_set') {
        api.setState('recordSet', event.payload.value);
    }
}
