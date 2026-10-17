/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var response = api.data.update_apps_now.output;
    var success = response.success;
    if(success === false){
        api.setState('batchInstallationTracker', '');
        api.setState('hideProgress', true)
        api.setState('hideEditAlert', false);
        api.setState('hideUpdateScheduled', false);
        api.setState("hideUpdateNow", false);
        api.setState("hideScheduleUpdate", false);
    }
    api.setState('hideLoader', true);
    api.setState('hideCompleteAlert', true);
}
