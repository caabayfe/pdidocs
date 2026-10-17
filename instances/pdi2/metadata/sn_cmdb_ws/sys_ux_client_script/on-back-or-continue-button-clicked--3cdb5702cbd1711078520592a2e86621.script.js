function script({ api, event, helpers, imports }) {
    const { FORM_ICONS, EXCLUSION_FORM_VIEWS, getExclusionHideBackButton, getExclusionHideContinueButton } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { selectedTabId, dataFilter, formViewStateMap } = api.state;

    let currentView;
    if (!formViewStateMap[selectedTabId]) {
        console.error("Form view " + selectedTabId + " was not found during navigation");
        return;
    }

    var recordSelectionCount = api.state.recordSelection.selectionCount;
    var currentSelectedPolicyTypesList = api.state.selectedPolicyTypesList;

    // get the next or previous view for transition
    if (event.payload.id === "exclusion_form_back_button") {
        currentView = formViewStateMap[selectedTabId].previousView;

        if (selectedTabId === EXCLUSION_FORM_VIEWS.REVIEW) {
            api.setState("continueBtnDisabled", !(currentSelectedPolicyTypesList.length > 0));
        } else if (selectedTabId === EXCLUSION_FORM_VIEWS.POLICY_TYPE) {
            api.setState("continueBtnDisabled", !(recordSelectionCount > 0));
        }

    } else if (event.payload.id === "exclusion_form_continue_button") {
        
        if (selectedTabId === EXCLUSION_FORM_VIEWS.DATA_FILTER) {
            api.setState("continueBtnDisabled", !(currentSelectedPolicyTypesList.length > 0));
        } 
        
        currentView = formViewStateMap[selectedTabId].nextView;
        formViewStateMap[selectedTabId].statuses = FORM_ICONS.DONE.statuses;
        
        if (formViewStateMap[currentView].statuses.length > 0 && formViewStateMap[currentView].statuses[0].icon !== FORM_ICONS.DONE.statuses[0].icon) {
            formViewStateMap[currentView].statuses = FORM_ICONS.EDITING.statuses;
            formViewStateMap[currentView].disabled = false;
        }
        
    }
    if (!currentView) {
        console.error("Failed to get the next form view from " + selectedTabId);
        return;
    }


    const currentViewData = formViewStateMap[currentView];
    api.setState("selectedTabTitle", currentViewData.label);
    api.setState("selectedTabId", currentView);
    api.setState("selectedTabFormattedForContentTree", [[currentView]]);
    api.setState("isBackButtonHidden", getExclusionHideBackButton(currentView));
    api.setState("isContinueButtonHidden", getExclusionHideContinueButton(currentView));
    Object.keys(formViewStateMap).forEach(key => formViewStateMap[key].isHidden = currentView !== key);
    api.setState("formViewStateMap", formViewStateMap);

}
