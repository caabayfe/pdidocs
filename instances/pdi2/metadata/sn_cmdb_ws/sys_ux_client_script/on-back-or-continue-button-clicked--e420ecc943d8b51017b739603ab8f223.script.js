async function script({ api, event, helpers, imports }) {
    // handle the back or continue button click
    const { POLICY_FORM_VIEWS, FORM_ICONS, getHideBackButton, getHideContinueButton, focusElement } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { validatePolicyForm } = imports["sn_cmdb_ws.DataManagerPolicyFormUtil"]();
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { DM_POLICY_STATUS, DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { validatorModel, selectedTabId, policyData, formViewStateMap, policySysId } = api.state;
    let currentView;
    const navigateToView = () => {
        const currentViewData = formViewStateMap[currentView];
        api.setState("selectedTabTitle", currentViewData.label);
        api.setState("selectedTabId", currentView);
        api.setState("selectedTabFormattedForContentTree", [[currentView]]);
        api.setState("isBackButtonHidden", getHideBackButton(currentView));
        api.setState("isContinueButtonHidden", getHideContinueButton(currentView));
        Object.keys(formViewStateMap).forEach(key => formViewStateMap[key].isHidden = currentView !== key);
        api.setState("formViewStateMap", cloneDeep(formViewStateMap));
        focusElement({api, helpers}, currentViewData.focusElementId, currentView, policyData.general_info.cmdb_policy_type);
    }

    // TODO: Refresh the policy data on button click, if the policy is already created
    if (!formViewStateMap[selectedTabId]) {
        console.error("Form view " + selectedTabId + " was not found during navigation");
        return;
    }

    // get the next or previous view for transition
    if (event.payload.id === "policy_form_back_button") {
        currentView = formViewStateMap[selectedTabId].previousView;
        navigateToView();
        return;
    } else if (event.payload.id === "policy_form_continue_button") {
        if (policyData.status === DM_POLICY_STATUS.PUBLISHED) {
            currentView = formViewStateMap[selectedTabId].nextView;
            if(currentView == POLICY_FORM_VIEWS.REVIEW){
                if (!api.state.listProps || !api.state.listProps.table) {
                    api.data.getDataFilterEncodedQuery.execute({
                        "table": policyData.data_filter.table || api.state.defaultTable,
                        "encodedQuery": policyData.data_filter.encoded_query,
                        "policyTypeId": policyData.general_info.cmdb_policy_type
                    });
                    api.setState("hideDataFilterList", false);
                }
                // get the review data and card counts for review as long as the assignment data is populated
                if (policyData.assignment && Object.keys(policyData.assignment).length !== 0 &&
                    !Object.values(policyData.assignment).every(val => !val || val === "user_group_field")) {
                    api.data.get_data_manager_policy_review_info.execute({
                        "policySysId": policyData.policyId
                    });
                }
            }
            navigateToView();
            return;
        }
        let allFieldsValid = await validatePolicyForm(validatorModel, selectedTabId, policyData, helpers);
        if (!allFieldsValid) {
            // update the invalid state on fields that are required
            api.setState("validatorModel", cloneDeep(validatorModel));
            return;
        }
        // If it is the options tab, validate that the retention time value is correct
        if (selectedTabId === "options") {
            let archiveForDays = parseInt(policyData[selectedTabId].archive_for_days);
            let retentionTime = parseInt(policyData[selectedTabId].retention_time);
            let timeframeSelection = policyData[selectedTabId].retention_timeframe_selection;

            if (timeframeSelection === "days") {
                if (archiveForDays !== retentionTime)
                    policyData[selectedTabId].archive_for_days = retentionTime.toString();
            }
            else if (timeframeSelection === "months") {
                if (archiveForDays != (retentionTime * 30)) {
                    let months = retentionTime * 30;
                    policyData[selectedTabId].archive_for_days = months.toString();
                }
            }
            else if (timeframeSelection === "years") {
                if (archiveForDays != (retentionTime * 365)) {
                    let years = retentionTime * 365;
                    policyData[selectedTabId].archive_for_days = years.toString();
                }
            }
        }

        formViewStateMap[selectedTabId].statuses = FORM_ICONS.DONE.statuses;
        currentView = formViewStateMap[selectedTabId].nextView;
        // if the view has already been validated do not set to semi check
        if (formViewStateMap[currentView].statuses.length > 0 && formViewStateMap[currentView].statuses[0].icon !== FORM_ICONS.DONE.statuses[0].icon) {
            formViewStateMap[currentView].statuses = FORM_ICONS.EDITING.statuses;
            formViewStateMap[currentView].disabled = false;
        }
    }
    if (!currentView) {
        console.error("Failed to get the next form view from " + selectedTabId);
        return;
    }

    if(currentView == POLICY_FORM_VIEWS.REVIEW && policyData.general_info.cmdb_policy_type == DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION){
        api.data.get_data_certification_duplicate_policies.execute({
            policyId : policyData.policyId
        });
    }

    // if the data filter has changed and assignment info exists we need to refresh the record and task count for review
    if (selectedTabId === POLICY_FORM_VIEWS.DATA_FILTER && policyData.assignment && Object.keys(policyData.assignment).length !== 0 &&
            !Object.values(policyData.assignment).every(val => !val || val === "user_group_field")) {
        api.setState("refreshCounts", true);
    }

    // save the current view data
    if (!policySysId || policySysId == "-1") {
        api.data.dataManagerCreatePolicy.execute({
            "payload": {
                ...policyData[selectedTabId]
            }
        });
        return;
    } else {
        api.data.dataManagerUpdatePolicy.execute({
            "payload": {
                policySysId,
                "currentView": selectedTabId,
                "policyData": {
                    ...policyData
                }
            }
        });
        navigateToView();
    }
}
