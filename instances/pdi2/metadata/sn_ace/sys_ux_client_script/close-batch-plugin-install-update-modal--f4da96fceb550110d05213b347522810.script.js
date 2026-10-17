/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.close("plugin_batch_install_update_modal");
    api.setState('hidePluginBatchInstallUpdateModal', true);
}
