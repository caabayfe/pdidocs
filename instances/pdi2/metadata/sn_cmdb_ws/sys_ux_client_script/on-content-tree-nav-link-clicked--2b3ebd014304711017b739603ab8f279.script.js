function script({api, event, imports}) { 
    // when a content tree label is clicked on in the navigation UI

    const { getHideBackButton, getHideContinueButton, POLICY_FORM_VIEWS, focusElement } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { DM_POLICY_STATUS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const item = event.payload.item;
    const formViewStateMap = api.state.formViewStateMap;
    var policyData = api.state.policyData;
    if (policyData.status === DM_POLICY_STATUS.PUBLISHED) {
        if(item.id == POLICY_FORM_VIEWS.REVIEW){
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
    }
    Object.keys(formViewStateMap).forEach(key => formViewStateMap[key].isHidden = item.id !== key);
    api.setState("formViewStateMap", formViewStateMap);
    api.setState("selectedTabFormattedForContentTree", [[item.id]]);
    api.setState("selectedTabId", item.id);
    api.setState("selectedTabTitle", formViewStateMap[item.id].label);
    api.setState("isBackButtonHidden", getHideBackButton(item.id));
    api.setState("isContinueButtonHidden", getHideContinueButton(item.id));
    focusElement({api, helpers}, formViewStateMap[item.id].focusElementId, item.id, api.state.policyData.general_info.cmdb_policy_type);
 }
