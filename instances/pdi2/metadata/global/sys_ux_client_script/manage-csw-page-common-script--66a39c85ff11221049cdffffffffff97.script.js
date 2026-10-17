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
    const CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID = "5ee74940b70022108d4406dd1e11a918";

    const uiUtil = imports['global.SGTUIUtil'](api);
    const tms = api.state.tms; // tms = Translated Messages
    const API = {
        GET_KEEP_LIST_USER_ID: 'getKeepListUserId',
        GET_SCAN_HISTORY: 'getScanHistory',
        IS_ANY_REMOVAL_JOB_SCHEDULED_OR_RUNNING: 'isAnyRemovalJobScheduledOrRunning'

    };

    const fnMap = {
        'MACROPONENT_READY': onPageReady,
        'MACROPONENT_PROPERTY_CHANGED': onPagePropertyChanged,
        'keep_list_score': handleKeepListScoreClick,
        'remove_list_score': handleRemoveListScoreClick,
        'NOW_LIST#ROW_SELECT_TOGGLED': rowSelectToggled,
        'add_all_button': moveAllUsersToRemoveList,
        'add_selected_rows_button': moveUsersToOtherList,
        'sgt_data_broker': handleDataBrokerResponse,
        'NOW_LIST#CELL_LINK_CLICKED': handleListCellLinkClicked,
        "NOW_LIST#ACTIONABLE_MESSAGE_ACTION_CLICKED": listSelectAllHandler,
        'back_button': backButtonHandler,
        'list_controller': listControllerHandler
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    function onPageReady() {
        helpers.translate('Loading...').then(uiUtil.showLoader);
        _getScanHistory();
        uiUtil.translate([
            ['loading', helpers.translate('Loading...')],
            ['titleRemoveCSWG', helpers.translate('Remove from the conditional script writers group')],
            ['titleKeepCSWG', helpers.translate('Keep in the conditional script writers group')],
            ['usersToRemoveFromCSWGroup', helpers.translate('Users who will {0}no longer{1} be part of the conditional script writer group', '<b>', '</b>')],
            ['usersToKeepInCSWGroup', helpers.translate('Users who {0}will remain part{1} of the conditional script writer group', '<b>', '</b>')],
            ['removalJobRunning', helpers.translate('Conditional script writer group member removal job is running or scheduled')]
        ]).then(msg => uiUtil.setObjectState('tms', msg));
        showInfoMessage();
    }

    function onPagePropertyChanged() {
        showInfoMessage();
        uiUtil.showLoader(tms.loading);
        _showRemovalJobWarning(false);
        _getScanHistory();
    }

    function _getScanHistory() {
        uiUtil
            .newDataBroker()
            .addRequest(API.GET_SCAN_HISTORY, api.context.props.scanID)
            .addRequest(API.IS_ANY_REMOVAL_JOB_SCHEDULED_OR_RUNNING)
            .execute();
    }

    function showInfoMessage() {
        helpers.translate("Based on the scan results, we’ve placed users that have scripted recently in the “Keep list”. All other users were placed on the remove list. You can edit these below.")
            .then(content => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "keep_remove_info",
                        status: "info",
                        icon: "circle-info",
                        content: content,
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
            });
    }

    function init() {
        getCSWMembersCount();
        if (api.state.listProps.type == 'keepList') {
            setKeepListProps();
        } else {
            setRemoveListProps();
        }
        getOrCreateNonScriptedUsersDBView();
    }

    function resetScanResults(scanHistory, removalJobScheduledOrRunning) {
        api.setState('isManualScan', scanHistory.isManualScan);
        api.setState('jobScheduledTime', scanHistory.scheduledTime);
        _showRemovalJobWarning(removalJobScheduledOrRunning);
        let requests = [{
            action: "resetScanResults",
            params: {
                scanId: api.context.props.scanID,
                manualScan: scanHistory.isManualScan
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function handleDataBrokerResponse() {
        let output = event.payload.data.output;
        let action = output[0].action;
        let result = output[0].result;

        switch (action) {
            case API.GET_SCAN_HISTORY:
                resetScanResults(result, output[1].result);
                break;
            case "resetScanResults":
                init();
                break;
            case "getCSWMembersCount":
                onGetCSWMembersCount(result);
                break;
            case "moveUsersToRemoveList":
            case "moveUsersToKeepList":
            case "moveAllUsersToRemoveList":
                onMoveUsersToOtherList();
                break;
            case "getOrCreateNonScriptedUsersDBView":
                api.setState("nonScriptedUsersDBView", result);
                uiUtil.hideLoader();
                break;
            case API.GET_KEEP_LIST_USER_ID:
                setRemoveListForManualScan(result);
                break;
            case "getUserInScanResult":
            case "getUserInGRMember":
                helpers.navigate.to(null, null, null, null, null, null, {
                    url: "/sys_user.do?sys_id=" + result
                });
                break;
        }
    }

    function setRemoveListForManualScan(result) {
        var userIds = result.join(',');
        uiUtil.setObjectState("listProps", {
            title: tms.titleRemoveCSWG,
            type: "removeList",
            selectedRows: [],
            table: 'sys_user_grmember',
            filter: `group=${CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID}^sys_created_on<=${api.state.jobScheduledTime}^userNOT IN` + userIds,
            columns: "user.name,user.title,user.department",
            selectionEnabled: false,
            addLastScriptedColumn: true
        });
    };

    function onGetCSWMembersCount(result) {
        api.setState("cswMembersCount", result);
        setCSWGroupMembersText(result.total);
        setKeepListCount(result.scriptedUsers);
        setRemoveListCount(result.notScriptedUsers);
        setButtonsLabel(result, api.state.listProps.type);
    }

    function onMoveUsersToOtherList() {
        getCSWMembersCount();
        resetSelectedRows();
        api.data.list_controller.refreshRequested();
    }

    function setButtonsLabel(cswMembersCount, listType) {
        if (listType == "keepList") {
            let labelsToTranslate = [
                helpers.translate("Add to the remove list ({0})", 0),
                helpers.translate("Add all to the remove list ({0})", uiUtil.formatNumber(cswMembersCount.scriptedUsers))
            ];
            Promise.all(labelsToTranslate).then(translatedLabels => {
                uiUtil.setObjectState("tms", {
                    addSelectedButtonLabel: translatedLabels[0],
                    addAllButtonLabel: translatedLabels[1]
                });
            });
        } else {
            helpers.translate("Add to the keep list ({0})", 0).then(label => {
                uiUtil.setObjectState("tms", "addSelectedButtonLabel", label);
            });
        }
    }

    function setCSWGroupMembersText(groupMemberCount) {
        helpers.translate("Total users in the conditional script writer group: {0} users",
            uiUtil.formatNumber(groupMemberCount)).then(label => api.setState("cswGroupMembersText", label));
    };

    function setKeepListCount(keepListCount) {
        api.setState("keepList", uiUtil.formatNumber(keepListCount));
    }

    function setRemoveListCount(removeListCount) {
        api.setState("removeList", uiUtil.formatNumber(removeListCount));
    }

    function handleKeepListScoreClick() {
        uiUtil.showLoader(tms.loading);
        setKeepListProps();
        setButtonsLabel(api.state.cswMembersCount, "keepList");
    }

    function handleRemoveListScoreClick() {
        if (!api.state.nonScriptedUsersDBView && !api.state.isManualScan)
            return;
        uiUtil.showLoader(tms.loading);
        if (api.state.isManualScan) {
            uiUtil
                .newDataBroker()
                .addRequest(API.GET_KEEP_LIST_USER_ID, {
                    scanId: api.context.props.scanID
                })
                .execute();
            return;
        }
        setRemoveListProps();
        setButtonsLabel(api.state.cswMembersCount, "removeList");
    }

    function setKeepListProps() {
        let listFilter = `scan=${api.context.props.scanID}^keep=true`;
        uiUtil.setObjectState("listProps", {
            table: "sgt_scan_result",
            filter: listFilter,
            columns: "user.name,last_scripted,user.title,user.department",
            title: tms.titleKeepCSWG,
            selectedRows: [],
            type: "keepList",
            selectionEnabled: true,
            addLastScriptedColumn: false,
            ts: Date.now()
        });
    }

    function setRemoveListProps() {
        uiUtil.setObjectState("listProps", {
            title: tms.titleRemoveCSWG,
            selectedRows: [],
            type: "removeList",
            selectionEnabled: true,
            table: api.state.nonScriptedUsersDBView,
            filter: `grmember_group=${CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID}^grmember_sys_created_on<=${api.state.jobScheduledTime}^ssr_user=NULL^ORssr_keep=false`,
            columns: "grmember_user.name,ssr_last_scripted,grmember_user.title,grmember_user.department",
            addLastScriptedColumn: false,
            ts: Date.now()
        });
    }

    function getCSWMembersCount() {
        uiUtil
            .newDataBroker()
            .getCSWMembersCount(api.context.props.scanID);
    }

    function getOrCreateNonScriptedUsersDBView() {
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

    function rowSelectToggled() {
        setSelectedRowsOnToggle();
        setButtonLabelsOnRowSelection();
    }

    function setSelectedRowsOnToggle() {
        let listProps = api.state.listProps;
        let selectedRows = listProps.selectedRows;
        let payloadValue = event.payload.value;
        let rowsToggled = Array.isArray(payloadValue) ? payloadValue : [payloadValue];

        if (event.payload.checked) {
            rowsToggled.forEach(rowToggled => {
                if (selectedRows.some(selectedRow => selectedRow.rowId == rowToggled))
                    return;

                let row = {};
                row.rowId = rowToggled;
                if (listProps.type == "keepList") {
                    row.scanResultId = event.payload.selectedRows[rowToggled].cells.last_scripted.metadata.openRecordMetadata.sysId;
                    row.lastScripted = event.payload.selectedRows[rowToggled].cells.last_scripted.value;
                } else {
                    row.scanResultId = event.payload.selectedRows[rowToggled].cells.ssr_last_scripted.metadata.openRecordMetadata.sysId;
                    row.grmemberId = event.payload.selectedRows[rowToggled].cells["grmember_user.name"].metadata.openRecordMetadata.sysId;
                    row.lastScripted = event.payload.selectedRows[rowToggled].cells.ssr_last_scripted.value;
                }
                selectedRows.push(row);
            });
        } else {
            selectedRows = selectedRows.filter(row => !rowsToggled.includes(row.rowId));
        }

        listProps.selectedRows = selectedRows;
        uiUtil.setObjectState("listProps", listProps);
    }

    function setButtonLabelsOnRowSelection() {
        let listType = api.state.listProps.type;
        let selectedRows = api.state.listProps.selectedRows;
        if (listType == "keepList") {
            helpers.translate("Add to the remove list ({0})", selectedRows.length).then(label => {
                uiUtil.setObjectState("tms", "addSelectedButtonLabel", label);
            });

        } else {
            helpers.translate("Add to the keep list ({0})", selectedRows.length).then(label => {
                uiUtil.setObjectState("tms", "addSelectedButtonLabel", label);
            });
        }
    }

    function moveAllUsersToRemoveList() {
        let requests = [{
            action: "moveAllUsersToRemoveList",
            params: {
                scanId: api.context.props.scanID
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function moveUsersToOtherList() {
        let listProps = api.state.listProps;
        let selectedRows = listProps.selectedRows;
        if (listProps.type == "keepList") {
            moveUsersToRemoveList(selectedRows);
        } else {
            moveUsersToKeepList(selectedRows);
        }
    }

    function moveUsersToRemoveList(selectedRows) {
        let requests = [{
            action: "moveUsersToRemoveList",
            params: {
                scanResults: selectedRows
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function moveUsersToKeepList(selectedRows) {
        let requests = [{
            action: "moveUsersToKeepList",
            params: {
                scanId: api.context.props.scanID,
                scanResults: selectedRows
            }
        }];
        api.data.sgt_data_broker.execute({
            requests: requests
        });
    }

    function handleListCellLinkClicked() {
        let request = {};
        let listTable = api.state.listProps.type;
        let rowSysId = event.payload.cell.metadata.openRecordMetadata.sysId;
        if (listTable == "keepList") {
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

    function resetSelectedRows() {
        let listProps = api.state.listProps;
        listProps.selectedRows = [];
        uiUtil.setObjectState("listProps", listProps);
    }

    function listSelectAllHandler() {
        uiUtil.clearNotifications();
        helpers.translate('"Select all" list items is not supported').then(label => {
            uiUtil.showWarningNotification(label);
        });
    }

    function backButtonHandler() {
        uiUtil.clearNotifications();
        if (api.state.isManualScan) {
            helpers.navigate.to('home');
        } else {
            helpers.navigate.to('scan-results', {
                scanID: api.context.props.scanID
            }, {
                ts: Date.now()
            });
        }
    }

    function listControllerHandler() {
        uiUtil.hideLoader();
    }

    function _showRemovalJobWarning(removalJobScheduledOrRunning) {
        api.setState('removalJobScheduledOrRunning', removalJobScheduledOrRunning);
        if (removalJobScheduledOrRunning) {
            uiUtil.clearNotifications();
            uiUtil.showWarningNotification(tms.removalJobRunning);
        }
    }

}
