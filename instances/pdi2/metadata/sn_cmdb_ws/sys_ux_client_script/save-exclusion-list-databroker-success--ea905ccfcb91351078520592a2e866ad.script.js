async function script({ api, event, helpers, imports }) {
    const {
        DM_PAGE_TABS
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { EXCLUSION_NOTIFICATION_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();

    // reset everything after successful data broker return. Somehow, if we don't do this, the reset doesn't happen with macroponent_property_changed script 
    // the following is a copy & paste of the same script from "macroponent property changed" script. 
    //for some reasons, running these states re-set once doesn't clear and reset everything but running it twice does. 
    // So this stuff gets run once after saving the list by the codes below, and it will get run again when they come back to the page via macrponent_property_changed event script invoking
    const { getExclusionFormViewStateMap, getExclusionHideBackButton, getExclusionHideContinueButton } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const stateMap = await getExclusionFormViewStateMap(helpers);

    const {
        dataFilter,
        recordSelection
    } = api.state;

    const impactedRecordCount = event.payload.data?.output?.insertedRecordCount

    let {
        selectedTabId,
        formViewStateMap,
        selectedTabFormattedForContentTree,
        selectedPolicyTypesList,
    } = api.state;

    selectedTabId = "data_filter";
    formViewStateMap = stateMap;
    selectedPolicyTypesList = [];

    api.setState("selectedTabTitle", stateMap.data_filter.label);
    api.setState("selectedTabId", selectedTabId);
    api.setState("selectedTabFormattedForContentTree", [["data_filter"]]);
    api.setState("formViewStateMap", formViewStateMap);

    api.setState("isBackButtonHidden", getExclusionHideBackButton(api.state.selectedTabId));
    api.setState("isContinueButtonHidden", getExclusionHideContinueButton(api.state.selectedTabId));

    dataFilter.encoded_query = "";
    dataFilter.table = "cmdb_ci"
    dataFilter.tableLabel = "Configuration Item";
    api.setState("dataFilter", dataFilter);
    api.setState("hideDataFilterList", true);
    api.setState("dataFilterListRefresh", { timestamp: new Date() });

    recordSelection.allRecordsSelected = false;
    recordSelection.selectedRecords = null;
    recordSelection.selectionCount = 0;
    recordSelection.query = null;
    recordSelection.table = null;
    api.setState("continueBtnDisabled", true);
    api.setState("encodedQueryDisplayValue", {});
    api.setState("policyTypeListItems", []);
    api.setState("recordSelection", recordSelection);

    helpers.navigate.to('data-manager', null, {
        showNotification: impactedRecordCount === -1 ?
            EXCLUSION_NOTIFICATION_MSG_CODES.SAVE_EXCLUSION_LIST_QUEUED :
            EXCLUSION_NOTIFICATION_MSG_CODES.SAVE_EXCLUSION_LIST_SUCCESS,
        selectedTabIndex: DM_PAGE_TABS.EXCLUDED_CIS,
        ts: Date.now()
    }, null, null, 'current');
}
