/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var response = api.data.delete_schedule.output;
    helpers.modal.close('cancel_schedule');
    api.setState('hideLoader', true);
    if (response && response.success) { 
        api.setState('hideUpdateScheduled', true); 
        api.setState('scheduleTime', '');
    }
}
