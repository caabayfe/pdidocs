/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.fetch_mif_instances_1.refresh;
    helpers.modal.open('multi_instance_setup_modal');
}
