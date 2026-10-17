async function handler({ api, event, helpers, imports }) {
    const { getExclusionFormViewStateMap, getExclusionHideBackButton, getExclusionHideContinueButton } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const stateMap = await getExclusionFormViewStateMap(helpers);

    api.setState("selectedTabTitle", stateMap.data_filter.label);
    api.setState("selectedTabId", "data_filter");
    api.setState("selectedTabFormattedForContentTree", [["data_filter"]]);
    api.setState("formViewStateMap", stateMap);
    api.setState("isBackButtonHidden", getExclusionHideBackButton(api.state.selectedTabId));
    api.setState("isContinueButtonHidden", getExclusionHideContinueButton(api.state.selectedTabId));
}
