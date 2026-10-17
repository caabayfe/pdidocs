function handler({api, event, helpers, imports}) { 
// when a content tree label is clicked on in the navigation UI

const { getExclusionHideBackButton , getExclusionHideContinueButton } = imports["sn_cmdb_ws.DataManagerStateUtil"]();

    const item = event.payload.item;
    const formViewStateMap = api.state.formViewStateMap;
    Object.keys(formViewStateMap).forEach(key => formViewStateMap[key].isHidden = item.id !== key);
    api.setState("formViewStateMap", formViewStateMap);
    api.setState("selectedTabFormattedForContentTree", [[item.id]]);
    api.setState("selectedTabId", item.id);
    api.setState("selectedTabTitle", formViewStateMap[item.id].label);
    api.setState("isBackButtonHidden", getExclusionHideBackButton(item.id));
    api.setState("isContinueButtonHidden", getExclusionHideContinueButton(item.id));
}
