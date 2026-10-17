function handler({api, event, helpers, imports}) {
    var selectedRulesArr = event.elementId === "rules_typeahead_multi" ? event.payload.value : event.payload.items;
  
    api.setState("selectedRules", selectedRulesArr);
    api.setState('tableFields', []);
    api.setState('additionalAttrFields', []);
    api.setState('lifeCycleFields', []);

    let {
        navButtonState,
        leftNavItems,
        selectedTabId
    } = api.state;
    let currentViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
    navButtonState['continue']['disabled'] = false;

    const {
        processSelectedRules,
        FORM_ICONS
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);

    let newNavItems = leftNavItems.map((item, index) => {
        if (index > currentViewIndex) {
            item = {
                ...item,
                ...FORM_ICONS.LOCKED
            };
        }
        return item;
    });
    const viewData = newNavItems[currentViewIndex];
    
    api.setState('selectedTabTitle', viewData.label);
    api.setState('selectedTabId', viewData.id);
    api.setState('leftNavSelectedItem', [[viewData.id]]);
    api.setState('leftNavItems', newNavItems);
    api.setState("navButtonState", navButtonState);

    
    processSelectedRules(selectedRulesArr, false);

}
