/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = await aceUtils.getContext();
    if (eventName == "dashboard-dropdown-item-clicked") {
        blockcontext.newDefaultDashboardSelection.sysId = eventPayload.item.id;
        if (eventPayload.item.id != blockcontext.defaultDashboard.sysId)
            blockcontext.disableSave = false;
        else
            blockcontext.disableSave = true;
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "save-clicked") {
        let successMessage = await helpers.translate("Default Dashboard Saved Successfully.");
        let errorMessage = await helpers.translate("Default Dashboard is not Saved. Please try again.");
        await aceUtils.refreshContentBlock('default_dashboard_save');
        blockcontext = await aceUtils.getContext();
        let msgs = {
            "items": []
        };
        msgs.items.push({
            "id": "message",
            "action": {
                "type": "dismiss"
            },
            "content": blockcontext.showSavedAlert ? successMessage : errorMessage,
            "status": blockcontext.showSavedAlert ? "positive" : "critical",
            "icon": "info-circle-outline"

        });
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
        blockcontext.disableSave = true;
        await aceUtils.setContext(blockcontext);

    }

}
