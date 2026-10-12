/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {convertDateFormat} = imports['sn_upgrade_mgmt.UpgradeManagementUtils']();
    var response = api.data.get_page_details.output;
    var installTracker = response.batchInstallExecutionTracker;
    var batchSchedule = response.batchInstallationSchedule;
    var percentComplete = parseInt(response.batchInstallExecutionTrackerProgress) || 0;
    api.setState('storeAppsCount', response.storeAppsNewInstallCount);
    api.setState('nowAssistAppsCount', response.nowAssistAppsNewInstallCount);
    api.setState('batchInstallationSchedule', response.batchInstallationSchedule);
    api.setState('batchInstallationTracker', "");
    api.setState('batchInstallationTracker', response.batchInstallExecutionTracker);
    api.setState('disableRefresh', false);
    
    // convertDateFormat returns this sentinel for null/undefined/unparseable input; see UpgradeManagementUtils.
    const INVALID_DATE = 'Invalid date string';
    const EMPTY_PLACEHOLDER = '-';
    const formattedScheduleTime = convertDateFormat(response.batchInstallationScheduleTime);
    const formattedTrackerStartTime = convertDateFormat(response.batchInstallExecutionTrackerStartTime);
    api.setState('scheduleTime', response.batchInstallationScheduleTime);
    api.setState('formattedSystemScheduleTime', formattedScheduleTime === INVALID_DATE ? EMPTY_PLACEHOLDER : formattedScheduleTime);
    api.setState('trackerStartTime', formattedTrackerStartTime === INVALID_DATE ? EMPTY_PLACEHOLDER : formattedTrackerStartTime);
    api.setState('progressPercent', percentComplete);
    
    api.setState('disableMarkComplete', true);
    
    if(installTracker == ""){
        api.setState('hideProgress', true);
        api.setState("hideUpdateNow", false);
        api.setState("hideScheduleUpdate", false);
        api.setState('hideCompleteAlert', true);
        api.setState('hideEditAlert', false);
    } else {
        api.setState('hideProgress', false);
        api.setState("hideUpdateNow", true);
        api.setState("hideScheduleUpdate", true);
        api.setState('hideEditAlert', true);
    }
    
    if(batchSchedule){
        api.setState('hideUpdateScheduled', false);
        api.setState("hideUpdateNow", false);
        api.setState("hideScheduleUpdate", false);
        api.setState('hideEditAlert', false);
    }
    
    if(response?.totalNewInstallCount == 0){
        api.setState('disableScheduleUpdate', 'true');
        api.setState('disableUpdateNow', 'true');
    }
    var msg = '';
    if(percentComplete < 100){
        msg = await helpers.translate('Updating applications... ({0}%)', percentComplete);
        api.setState('progressLabel', msg);
        api.setState('hideCompleteAlert', true);
        api.setState('disableMarkComplete', true);
        api.setState('hideUpdateInProgress', false);
        api.setState('hideUpdateComplete', true);
    } else {
        msg = await helpers.translate('Applications updated! ({0}%)',percentComplete);
        api.setState('progressLabel', msg);
        api.setState('hideCompleteAlert', false);
        api.setState('disableMarkComplete', false);
        api.setState('hideUpdateInProgress', true);
        api.setState('hideUpdateComplete', false);
    }
}
