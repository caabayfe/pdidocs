/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, helpers}) {
    var selectedRows = api.state.selectedRows || {};
    var appKeys = Object.keys(selectedRows);
    var totalKeys = appKeys.length;
    var completed = 0;

    if (!appKeys.length) {
        api.setState("shouldDisableScheduleBtn", false);
        return;
    }
    
    api.setState("isUpgradeTableLoading", true);

    function markComplete() {
        completed++;
        if (completed === totalKeys) {
            // All requests finished (success or fail). Clear loading state in
            // both paths so a refresh failure cannot leave the table spinning.
            api.data.get_app_upgrade_list_1.refresh();
            api.setState("selectedRows", {});
            api.setState("isUpgradeTableLoading", false);
        }
    }

    for (var i = 0; i < appKeys.length; i++) {
        var row = selectedRows[appKeys[i]];
        var scheduleId = row?.cells?.schedule?.schedule_id;
        if(!scheduleId){
            markComplete();
            continue;
        }
        var url = '/api/sn_appclient/v1/appmanager/schedule?action=delete_schedule&source_app_id=' + row?.cells?.app_sys_id?.value + '&schedule_id=' + scheduleId;
        helpers.snHttp(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }
        ).then(response => {
            markComplete();
        })
        .catch(error => {
            markComplete();
            console.error("Error in UIB client script Delete schedule selected apps:", error);
        });
    }
}
