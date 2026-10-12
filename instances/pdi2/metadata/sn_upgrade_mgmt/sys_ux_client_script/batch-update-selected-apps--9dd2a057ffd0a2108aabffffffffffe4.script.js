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
    api.setState("shouldDisableUpdateBtn", true);

    var selectedRows = api.state.selectedRows || {};
    var appKeys = Object.keys(selectedRows);

    if (appKeys.length === 0) {
        api.setState("shouldDisableUpdateBtn", false);
        return;
    }

    api.setState("isUpgradeTableLoading", true);

    function getCurrentDateTime() {
        // Get current date and time
        var currentDate = new Date();

        // Format the date as "yyyy-MM-dd-HH-mm-ss"
        var year = currentDate.getFullYear();
        var month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        var day = String(currentDate.getDate()).padStart(2, '0');
        var hours = String(currentDate.getHours()).padStart(2, '0');
        var minutes = String(currentDate.getMinutes()).padStart(2, '0');
        var seconds = String(currentDate.getSeconds()).padStart(2, '0');

        // Concatenate with "-" instead of ":" or space
        return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    }

    const packages = [];

    var deleteCompletedCount = 0;


    function markDeleteScheduleComplete() {
        deleteCompletedCount++;
        if (deleteCompletedCount === appKeys.length) {
            // All requests finished
            callBatchUpdate();
        }
    }

    for (var i = 0; i < appKeys.length; i++) {
        var row = selectedRows[appKeys[i]];
        var scheduleId = row?.cells?.schedule?.schedule_id;
        if(!scheduleId){
            markDeleteScheduleComplete();
            continue;
        }
        var url = '/api/sn_appclient/v1/appmanager/schedule?action=delete_schedule&source_app_id=' + row?.cells?.app_sys_id?.value + '&schedule_id=' + scheduleId;
        helpers.snHttp(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        ).then(response => {
            markDeleteScheduleComplete();
        })
        .catch(error => {
            markDeleteScheduleComplete();
            console.error("Error deleting schedule:", error);
        });
    }

    function callBatchUpdate() {
        for (let i = 0; i < appKeys.length; i++) {
            const app = selectedRows[appKeys[i]].cells;
            packages.push({
                id: app.app_sys_id.value,
                type: "application",
                load_demo_data: false,
                name: app.app_name.value,
                scope: app.scope.value,
                installed_version: app.current_version.value,
                requested_version: String(app.upgrade_version.componentProps.selectedItems[0] || ""),
                //schedule: app.schedule
            });
        }    

        var payload = {
            name: packages.length <= 1 ? "UpgradeManagementConsoleBatchUpdate_" + packages[0].name : "UpgradeManagementConsoleBatchUpdate",
            product_id: "UpgradeManagementConsoleBatchUpdate-" + getCurrentDateTime(),
            packages: packages
        };
    
        helpers.snHttp(
                '/api/sn_appclient/v1/appmanager/product/install', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: payload
                }
            ).then(response => {
                api.data.get_app_upgrade_list_1.refresh();
                api.setState("selectedRows", {});
            })
            .catch(error => {
                console.error("Error creating schedule:", error);
            });
    }
}
