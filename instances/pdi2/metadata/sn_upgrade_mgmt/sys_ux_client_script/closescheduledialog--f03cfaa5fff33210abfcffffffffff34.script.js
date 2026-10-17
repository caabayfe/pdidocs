/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.elementId == 'update_cancel'){
        helpers.modal.close('schedule_update');
    } else if(event.elementId == 'delete_cancel'){
        helpers.modal.close('cancel_schedule');
    }
}
