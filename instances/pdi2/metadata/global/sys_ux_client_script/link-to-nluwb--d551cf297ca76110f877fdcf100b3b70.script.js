/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.get_nluwb_plugin_info.output.active && api.data.get_nluwb_plugin_info.output.admin_console_version) {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/nlu-workbench/nlu-expert-feedback-loop/issue_auto_resolution'
            }
        });
    }
    else {
        helpers.modal.open('nluwb_modal', {});
    }
}
