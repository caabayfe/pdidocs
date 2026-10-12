/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(()=> api.data.look_up_multiple_records_2.refresh(), 1000);
    helpers.modal.close('custom_1');
}
