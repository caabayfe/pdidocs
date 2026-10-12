/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { FORM_ICONS, navigateToView, markCurrStepDone, IRE_ACTIONS } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    let {
        leftNavItems,
        selectedTabId,
        userPayload,
        selectedClass
    } = api.state;

    const {
        WARNING_NOTIFICATION_PROPS,
        showNotification
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
 
    var output = event.payload.data.output.result;
    const operation = output[0].operation;
    if(operation == "INSERT") {
        if (selectedTabId == "review") {
            api.data.identify_ci.execute({
                payload: userPayload,
                action: IRE_ACTIONS.INSERT,
                applicationId: api.context.app.appId,
                addtlContext: api.context.props.addtlContext
            });
        } else {
            let currentViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
            markCurrStepDone(leftNavItems, currentViewIndex, FORM_ICONS);
        }
    } else if (operation.startsWith("UPDATE")) {
        api.setState("identifyCiExstingSysId", output[0].sysId);
        api.setState("identifyCiExistingCiClass", output[0].className);
        helpers.modal.open("identify_ci_modal");
    } else {
        //show notification
        var warningArr = output[0].warnings;
        let notifications = [];
        warningArr.forEach((err, i) => {
            notifications.push({
                ...WARNING_NOTIFICATION_PROPS,
                id: 'errorId' + i + new Date().valueOf(),
                content: err.originalErrorMessage,
                header: err.message
            });
        });

        showNotification({ api, helpers }, notifications);
        console.error("CODE: " + output[0].operation + " level: " + output[0].level);
    }
        
    
}
