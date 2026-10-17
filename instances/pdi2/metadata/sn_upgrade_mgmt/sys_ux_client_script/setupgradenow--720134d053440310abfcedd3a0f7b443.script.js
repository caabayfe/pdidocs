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
    var tracker = response.trackerId;
    if(success === true && tracker != null){
        api.setState('batchInstallationTracker', tracker);
        api.setState('hideProgress', false)
        api.setState('hideEditAlert', true);
        api.setState('hideUpdateScheduled', true);
        api.setState("hideUpdateNow", true);
        api.setState("hideScheduleUpdate", true);
        api.setState('trackerStartTime', '-');
    }
    api.setState('hideLoader', true);
    api.setState('hideCompleteAlert', true);
}
