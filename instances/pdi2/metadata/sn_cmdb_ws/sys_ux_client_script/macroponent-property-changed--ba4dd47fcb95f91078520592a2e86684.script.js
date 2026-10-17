async function handler({ api, event, helpers, imports }) {
    const { getExclusionFormViewStateMap, getExclusionHideBackButton, getExclusionHideContinueButton } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const stateMap = await getExclusionFormViewStateMap(helpers);

    const {
        dataFilter,
        recordSelection,
        policyTypeListItems
    } = api.state;

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
    api.setState("selectedPolicyTypesList", selectedPolicyTypesList);

    api.setState("isBackButtonHidden", getExclusionHideBackButton(selectedTabId));
    api.setState("isContinueButtonHidden", getExclusionHideContinueButton(selectedTabId));

    if (!policyTypeListItems || policyTypeListItems.length === 0) {
        api.data.get_policy_types.refresh();
    } else {
        const policyTypeListItemsArr = [];
        api.setState("policyTypeListItems", []);
        policyTypeListItems.forEach((policyTypeData) => {
            policyTypeListItemsArr.push({
                "label": policyTypeData.label,
                "itemId": policyTypeData.itemId,
                "checked": false
            });
        });
        helpers.timing.setTimeout(() => api.setState("policyTypeListItems", cloneDeep(policyTypeListItemsArr)), 250);
    }


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

    api.setState("recordSelection", cloneDeep(recordSelection));
    api.data.get_policy_types.refresh();

}
