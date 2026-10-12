/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    helpers
}) {
    function convertTo24HourFormat(timeStr) {
        return timeStr.replace(/(\d+):(\d+):(\d+) (\wM)/, function(_, h, m, s, ampm) {
            h = ampm === "PM" && h !== "12" ? +h + 12 :
                ampm === "AM" && h === "12" ? "00" : h;
            return ("0" + h).slice(-2) + ":" + m + ":" + s;
        });
    }

    api.setState("shouldDisableScheduleBtn", true);

    var selectedRows = api.state.selectedRows || {};
    var appKeys = Object.keys(selectedRows);
    var totalKeys = appKeys.length;
    var completed = 0;
    if (totalKeys === 0) {
        api.setState('shouldDisableUpdateBtn', true);
        api.setState('shouldDisableScheduleBtn', true);
        api.setState('shouldDisableDeleteScheduled', true);
        return;
    }

    api.setState('isUpgradeTableLoading', true);

    function markComplete() {
        completed++;
        if (completed === totalKeys) {
            // All requests finished (success or fail)
            api.data.get_app_upgrade_list_1.refresh();
            api.setState("selectedRows", {});
        }
    }

    var i, row, app;
    var start_time = convertTo24HourFormat(api.state.scheduleDateTime);

    for (i = 0; i < appKeys.length; i++) {
        row = selectedRows[appKeys[i]];
        app = row.cells;

        helpers.snHttp(
                '/api/sn_appclient/v1/appmanager/schedule?action=create_schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: "Schedule Batch Installation Plan",
                        start_time: start_time,
                        list_of_apps: [{
                            name: app.app_name.value,
                            scope: app.scope.value,
                            source_app_id: app.app_sys_id.value,
                            version: String(app.upgrade_version.componentProps.selectedItems[0] || ""),
                            is_store_app: !!app.is_store_app.value,
                            schedule: app.schedule
                        }]
                    })
                }
            ).then(response => {
                markComplete();
            })
            .catch(error => {
                markComplete();
                console.error("Error creating schedule:", error);
            });
    }

}
