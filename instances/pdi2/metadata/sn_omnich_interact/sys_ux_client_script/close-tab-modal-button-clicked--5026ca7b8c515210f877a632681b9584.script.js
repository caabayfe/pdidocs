/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
if (event.elementId == 'wrap_up_modal_cancel_button') {
        helpers.modal.close("wrap_up_close_tab_modal");
    } else if (event.elementId == 'wrap_up_modal_close_button') {
        api.emit('WRAP_UP#SCREEN_STATUS_CHANGED', {});
    }
}
