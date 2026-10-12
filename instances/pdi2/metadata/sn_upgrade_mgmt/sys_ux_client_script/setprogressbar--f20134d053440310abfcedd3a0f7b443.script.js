/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {convertDateFormat} = imports['sn_upgrade_mgmt.UpgradeManagementUtils']();
    const data = event.payload.data || {};
    const changes = data.changes || [];
    
    if (changes.includes('start_time')) {
        // convertDateFormat returns this sentinel for null/undefined/unparseable input; see UpgradeManagementUtils.
        const INVALID_DATE = 'Invalid date string';
        const EMPTY_PLACEHOLDER = '-';
        const formatted = convertDateFormat(data.record?.start_time?.value);
        const displayStartTime = formatted === INVALID_DATE ? EMPTY_PLACEHOLDER : formatted;
        api.setState('trackerStartTime', displayStartTime);
    }

    if(changes.includes('percent_complete')){
        const percentComplete = parseInt(data.record?.percent_complete?.value) || 0;
        api.setState('progressPercent', percentComplete);
        var msg = '';
        if(percentComplete < 100){
            api.setState('disableMarkComplete', true);
            // msg = await helpers.translateSync("Updating applications... ({0}%)", percentComplete);
            msg = "Updating applications... ("+ percentComplete + "%)";
            api.setState('progressLabel', msg);
            api.setState('hideUpdateInProgress', false);
            api.setState('hideUpdateComplete', true);
        } else {
            api.setState('hideCompleteAlert', false);
            api.setState('disableMarkComplete', false);
            // msg = await helpers.translateSync("Applications updated! ({0}%)", percentComplete);
            msg = "Applications updated! (" + percentComplete + "%)";
            api.setState('progressLabel', msg);
            api.setState('hideUpdateInProgress', true);
            api.setState('hideUpdateComplete', false);
        }

    }
}
