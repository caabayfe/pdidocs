/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var log = function(){}; try { log = imports['sn_upgrade_mgmt.UpgradeManagementUtils']().log; } catch(_e) {}
    try {
        const responseData = api?.data?.get_bulkapp_update_details_overview_page_1?.output;
        const state = responseData?.state;

        function showBulkInProgressCard() {
            if(responseData?.upgradeSessionGRSysIDChanged) {
                api.setState("bulkRecordWatcherSysID", responseData?.sys_id);
                api.setState("bulkPlaybookState", "");
                api.setState("isLoading", true);
            }

            const resumeBulkAppUpdateData = {};
            resumeBulkAppUpdateData.currentPatch = responseData?.currentPatch;
            resumeBulkAppUpdateData.sys_id = responseData?.sys_id;
            resumeBulkAppUpdateData.activityLabel = (responseData?.activeStepLabel || "") + " (" + (responseData?.activeStepCount || 1) + "/" + (responseData?.totalSteps || 0) + ")";

            api.setState("resumeBulkAppUpdateData", resumeBulkAppUpdateData);
        }

        api.setState("bulkPlaybookState", state);
        if(state === "PLAYBOOK_IN_PROGRESS") showBulkInProgressCard();

    } catch(e) {
        log(api, "Set bulk app update details", "Error in client script", e);
    }
}
