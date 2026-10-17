function script({api, event, helpers, imports}) { 
    const {
         itemId, checked
    } = event.payload;
  
    const { FORM_ICONS, resetCurrentTab  } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { selectedPolicyTypesList, selectedTabId, formViewStateMap } = api.state;
    var currentSelectedPolicyTypesList = selectedPolicyTypesList;

    if(checked === true) {
       var selectedPolicy = api.state.policyTypeListItems.find(item => item.itemId === itemId);
       currentSelectedPolicyTypesList.push(selectedPolicy);
    } else {
       currentSelectedPolicyTypesList = currentSelectedPolicyTypesList.filter(item => item.itemId !== itemId);
    }

    api.setState("continueBtnDisabled", !(currentSelectedPolicyTypesList.length > 0));
   
    if (currentSelectedPolicyTypesList.length === 0) {
        //change the current view's form icon status to editing, and next view's form icon status to locked
         resetCurrentTab(selectedTabId, formViewStateMap);
    }
    
    api.setState("selectedPolicyTypesList", currentSelectedPolicyTypesList);
}
