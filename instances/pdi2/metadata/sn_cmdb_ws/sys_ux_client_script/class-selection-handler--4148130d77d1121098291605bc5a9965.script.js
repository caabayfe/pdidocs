/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("tempSelectedClass", event.payload.value);
    const {
        FORM_ICONS,
        navigateToView
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    let {
        navButtonState,
        leftNavItems,
        dependencyState,
        defaultContinueBtnTooltip,
        labelsTooltips
    } = api.state;
    navButtonState['continue']['disabled'] = (event.payload.value == null || event.payload.value == "");

    let newNavItems = leftNavItems.map((item) => {
        if (item.id != 'select_class') {
            item = {
                ...item,
                ...FORM_ICONS.LOCKED
            };
        }
        return item;
    });
    const viewData = newNavItems[0];
    
    api.setState('selectedTabTitle', viewData.label);
    api.setState('selectedTabId', viewData.id);
    api.setState('leftNavSelectedItem', [[viewData.id]]);
    api.setState('leftNavItems', newNavItems);
    api.setState("navButtonState", navButtonState);
    labelsTooltips.continueBtnTooltip = defaultContinueBtnTooltip;
    api.setState("labelsTooltips", labelsTooltips);

    api.setState('tableFields', []);
    api.setState('additionalAttrFields', []);
    api.setState('lifeCycleFields', []);

    dependencyState.selectedDependentCi = null;
    dependencyState.selectedDependentObj = {};
    dependencyState.selectedDependentClass = null;
    dependencyState.classSelectDisabled = false;
    dependencyState.hideDepCiTypeahead = true;
    dependencyState.hideNoDepRelsAlert = true;
    dependencyState.hideNoDependentCIAlert = true;
    
    api.setState("dependencyState", JSON.parse(JSON.stringify(dependencyState)));
    api.setState("disableRuleSelection", false);
    api.setState("dependentCiValue", "");
}
