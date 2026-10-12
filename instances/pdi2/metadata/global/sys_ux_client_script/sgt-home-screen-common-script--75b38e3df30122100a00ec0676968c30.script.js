/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const uiUtil = imports['global.SGTUIUtil'](api);
    const ALLOWED_USER_COUNT = 500;
    const REMOVAL_SCHEDULED = 'removal-scheduled';
    const API_UPDATE_AUTO_PROVISIONING_STATUS = 'updateAutoProvisioningStatus';
    const tms = api.state.tms; // translated message

    const fnMap = {
        MACROPONENT_READY: pageReadyHandler,
        MACROPONENT_PROPERTY_CHANGED: pagePropertyChangeHandler,
        auto_provisioning_toggle: updateAutoProvisioning,
        sgt_data_broker: dataBrokerResponseHandler,
        auto_provisioning_status: updateAutoProvisioningStatus,
        'NOW_LIST#CELL_LINK_CLICKED': cellLinkClicked
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    function pageReadyHandler() {
        uiUtil.showLoader();
        api.data.auto_provisioning_status.refresh();
        api.data.users_in_conditional_script_writer_group.refresh();
        uiUtil.translate([
            ['scanScheduled', helpers.translate('A scan has been scheduled.')],
            ['removalScheduled', helpers.translate('Removal has been scheduled.')],
            ['loading', helpers.translate('Loading...')],
            ['updating', helpers.translate('Updating...')],
            ['scheduling', helpers.translate('Scheduling...')],
            ['allowedUserCountForManualScan', helpers.translate('Only {0} users can allow for manual scan', ALLOWED_USER_COUNT)],
            ['noUserSelected', helpers.translate('Please select the user and continue')],
            ['usersToRemoveFromCSWGroup', helpers.translate('Users who will {0}no longer{1} be part of the conditional script writer group', '<b>', '</b>')],
            ['usersToKeepInCSWGroup', helpers.translate('Users who {0}will remain part{1} of the conditional script writer group', '<b>', '</b>')],
            ['serverError', helpers.translate("The server encountered an internal error and couldn't process your request")],
            ['autoProvisioningUpdateError', helpers.translate('Enabling auto-assignment of new users to the conditional script writer group is not possible.')]
        ]).then(msg => api.setState('tms', msg));
    }

    function pagePropertyChangeHandler() {
        if (api.context.props.src === REMOVAL_SCHEDULED) {
            uiUtil.showSuccessNotification(api.state.tms.removalScheduled);
        }
    }

    function updateAutoProvisioning() {
        uiUtil.clearNotifications();
        uiUtil.showLoader(api.state.tms.updating);
        api.setState('autoProvisioningStatus', event.payload.value);
        uiUtil
            .newDataBroker()
            .addRequest(API_UPDATE_AUTO_PROVISIONING_STATUS, event.payload.value)
            .execute();
    }

    function cellLinkClicked() {
        var payload = event.payload;
        var scanHistorySysId = payload.context.row.key;
        switch (payload.context.columnKey) {
            case "scan_number":
                if (payload.context.row.cells.status.value == "completed") {
                    helpers.navigate.to("scan-results", {
                        scanID: scanHistorySysId
                    }, {
                        ts: Date.now()
                    });
                } else {
                    helpers.navigate.to(null, null, null, null, null, null, {
                        url: "/sgt_scan_history.do?sys_id=" + scanHistorySysId
                    });
                }
                break;
            case "removal_scan_number":
                helpers.navigate.to(null, null, null, null, null, null, {
                    url: "/sgt_grmember_removal_job_history.do?sys_id=" + scanHistorySysId
                });
                break;
            case "action":
                if (payload.cell.value != '-')
                    cancelScan(scanHistorySysId);
                break;
        }
    }

    function cancelScan(scanHistorySysId) {
        uiUtil.newDataBroker()
            .addRequest("cancelScan", {
                sysId: scanHistorySysId
            })
            .execute();
    }

    function dataBrokerResponseHandler() {
        var payload = event.payload;
        uiUtil.hideLoader();
        const output = event.payload.data.output;
        switch (output[0].action) {
            case API_UPDATE_AUTO_PROVISIONING_STATUS:
                var result = output[0].result;
                if (result.previousValue == result.currentValue) {
                    uiUtil.showErrorNotification(tms.autoProvisioningUpdateError);
                    api.setState('autoProvisioningStatus', result.previousValue);
                }
                break;
        }
    }

    function updateAutoProvisioningStatus() {
        uiUtil.hideLoader();
        api.setState('autoProvisioningStatus', api.data.auto_provisioning_status.results[0].value.value == 'true');
    }
}
