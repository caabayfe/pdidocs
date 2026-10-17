/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.elementId === 'delete_button') {
        helpers.modal.open("delete_simulation", {});
    }
    else if (event.elementId === 'schedule_button') {
        helpers.modal.open("schedule_modal", {});
    }
    else if (event.elementId === 'button_3' || event.elementId === 'button_4') {
        helpers.modal.close("delete_simulation", {});
    }
    else if (event.elementId === 'button_6') {
        helpers.modal.close("schedule_modal", {});
    }
}
