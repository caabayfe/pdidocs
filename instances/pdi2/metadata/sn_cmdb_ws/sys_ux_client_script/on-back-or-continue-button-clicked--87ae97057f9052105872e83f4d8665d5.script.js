/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { FORM_ICONS, navigateToView, IRE_ACTIONS, markCurrStepDone, transformUserPayload} = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        elementId
    } = event;
    const {
        leftNavItems,
        selectedTabId,
        userPayload,
        tempSelectedClass,
        initialUserPayload,
        labelsTooltips,
        selectedClass
    } = api.state;
    let currentViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);

    if (elementId === 'back_button') {
        if(currentViewIndex == 1) { 
            //if we're in required attributes step and we're going back to Select Class step, clear out the tooltip on Continue button
            labelsTooltips.continueBtnTooltip =  "";
            api.setState("labelsTooltips", labelsTooltips);
        }
        navigateToView(leftNavItems, currentViewIndex - 1);
        return;
    }

    if (elementId === 'continue_button') {
        if(selectedTabId == "required_attributes" || selectedTabId == "additional_attributes") {
            //convert userPayload to finalUserPayload
            var finalUserPayload = transformUserPayload(userPayload, selectedClass);          
            api.data.identify_ci.execute({
                payload: finalUserPayload,
                action: IRE_ACTIONS.IDENTIFY
            });
        } else if(selectedTabId == "select_class") {
            //reset these sates for when users change the selected class
            api.setState("selectedClass", tempSelectedClass);
            api.setState("selectedRules", []);
            api.setState("tableFields", []);
            api.setState("userPayload", initialUserPayload); 
            helpers.navigate.setRouteParams({'params' : {
                'sysClassName' :tempSelectedClass
            }});
            markCurrStepDone(leftNavItems, currentViewIndex, FORM_ICONS);
        } else {
            // Mark current step as done
            if(selectedTabId != "relationship_definition") {
                //only mark current stepa s done if selectedTabId is not relationship def
                markCurrStepDone(leftNavItems, currentViewIndex, FORM_ICONS);
            }             
        }        
    }
}
