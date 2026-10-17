/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

   if(api.data.get_current_scope_1.scopeData != null && api.data.get_current_scope_1.scopeData.sysId != api.state.notificationScope){
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "warningAlert",
            status: "warning",
            icon: "circle-check-outline",
            content: {
                type: "html",
                value: "Unable to perform this action due to scope issues." 
            },
            action: {
                type: "dismiss"
            },
        }]
    });
    }
    else{
    var activatedText = "activated";
    if (api.state.notifRecordJSON.active == "1")
        activatedText = "deactivated";
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "alert1",
            status: "info",
            content: {
                type: "html",
                value: ` \'${api.state.notifRecordJSON.name}\'  has been ${activatedText}.`,
            },
            action: {
                type: "dismiss"
            },
        }]
    });
    }
}
