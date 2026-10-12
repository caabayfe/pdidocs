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
    const CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID = "5ee74940b70022108d4406dd1e11a918";

    const fnMap = {
        'get_scan_record': getScanStartTime,
        'MACROPONENT_READY': resetScanResults,
        'MACROPONENT_PROPERTY_CHANGED': resetScanResults,
        'not_scripted_users_score': setNotScriptedUsersListProps,
        'sgt_data_broker': handleDataBrokerResponse,
        'scripted_users_score': setScriptedUsersListProps,
        'NOW_LIST#CELL_LINK_CLICKED': handleListCellLinkClicked,
        'manage_csw_button': manageCSWButtonClickHandler,
        'list_controller': listControllerHandler
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    function init() {
        getCSWMembersCount();
        if (api.state.listProps.type == 'keepList') {
            setScriptedUsersListProps();
        } else {
            setNotScriptedUsersListProps();
        }
        execGetOrCreateNonScriptedUsersDBView();
    }

    function getCSWMembersCount() {
        let requests = [{
            action: "getCSWMembersCount",
            params: {
                scanId: api.context.props.scanID
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function resetScanResults() {
        helpers.translate('Loading...').then(label => {
            api.setState('loading', label);
            uiUtil.showLoader(label);
        });
        let requests = [{
            action: "resetScanResults",
            params: {
                scanId: api.context.props.scanID,
                manualScan: false
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function setScriptedUsersListProps() {
        uiUtil.showLoader(api.state.loading);
        let listFilter = `scan=${api.context.props.scanID}`;
        helpers.translate("Users that have scripted").then(title => api.setState("listProps", {
            "table": "sgt_scan_result",
            "filter": listFilter,
            "columns": "user.name,last_scripted,user.title,user.department",
            "title": title,
            "type": "keepList"
        }));
    }

    function handleDataBrokerResponse() {
        let action = event.payload.data.output[0].action;
        let result = event.payload.data.output[0].result;

        switch (action) {
            case "resetScanResults":
                init();
                break;
            case "getCSWMembersCount":
                setScriptedUsersCount(result.scriptedUsers);
                setNotScriptedUsersCount(result.notScriptedUsers);
                break;
            case "getOrCreateNonScriptedUsersDBView":
                uiUtil.hideLoader();
                api.setState("nonScriptedUsersDBView", result);
                break;
            case "addDays":
                setSubtitle(result.displayValue);
                break;
            case "getUserInScanResult":
            case "getUserInGRMember":
                helpers.navigate.to(null, null, null, null, null, null, {
                    url: "/sys_user.do?sys_id=" + result
                });
                break;
        }
    }

    function setSubtitle(startTime) {
        let endTime = api.data.get_scan_record.result.scheduled_time.displayValue;
        helpers.translate("Scan result shows number of users in the conditional script writer group who have scripted and not scripted between {0} and {1}",
            startTime, endTime).then(label => api.setState("subtitle", label));
    }

    function setNotScriptedUsersListProps() {
        let dbViewName = api.state.nonScriptedUsersDBView;
        if (!dbViewName)
            return;
        uiUtil.showLoader(api.state.loading);
        helpers.translate("Users that have not scripted").then(title => api.setState("listProps", {
            "table": dbViewName,
            "filter": `grmember_group=${CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID}^grmember_sys_created_on<=${api.state.jobScheduledTime}^ssr_user=NULL`,
            "columns": "grmember_user.name,ssr_last_scripted,grmember_user.title,grmember_user.department",
            "title": title,
            "type": "removeList"
        }));
    }

    function getScanStartTime() {
        let not_scripted_in_days = api.data.get_scan_record.result.not_scripted_in_days.value;
        let scheduledTime = api.data.get_scan_record.result.scheduled_time.value;
        api.setState('jobScheduledTime', scheduledTime);
        let requests = [{
            action: "addDays",
            params: {
                time: scheduledTime,
                daysToAdd: not_scripted_in_days * -1
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function handleListCellLinkClicked() {
        let request = {};
        let listTable = api.state.listProps.table;
        let rowSysId = event.payload.cell.metadata.openRecordMetadata.sysId;
        if (listTable == "sgt_scan_result") {
            request = {
                action: "getUserInScanResult",
                params: {
                    scanResultId: rowSysId
                }
            };
        } else {
            request = {
                action: "getUserInGRMember",
                params: {
                    grMemberId: rowSysId
                }
            };
        }
        api.data.sgt_data_broker.execute({
            requests: [request]
        });
    }

    function setScriptedUsersCount(count) {
        api.setState("scriptedUsers", uiUtil.formatNumber(count));
    }

    function setNotScriptedUsersCount(count) {
        api.setState("notScriptedUsers", uiUtil.formatNumber(count));
    }

    function execGetOrCreateNonScriptedUsersDBView() {
        let requests = [{
            action: "getOrCreateNonScriptedUsersDBView",
            params: {
                scanId: api.context.props.scanID
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function manageCSWButtonClickHandler() {
        helpers.navigate.to('manage-conditional-script-writers', {
            scanID: api.context.props.scanID
        }, {
            ts: Date.now()
        });
    }

    function listControllerHandler() {
        uiUtil.hideLoader();
    }

}
