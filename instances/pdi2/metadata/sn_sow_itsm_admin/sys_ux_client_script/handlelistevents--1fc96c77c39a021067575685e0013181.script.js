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
    //state variables --> aceContents, blockcontext
    var blockcontext = await aceUtils.getContext();
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    let msgs = {
        "items": []
    };
    if (eventName == "SOW_ADMIN_CENTER_LIST#ROW_REORDERED") {

        var movedRowSysId = eventPayload.data.movedRows[0];
        var rowsAfterUpdate = eventPayload.data.rowsAfterUpdate;

        // Find the position of the moved row in the updated list
        var movedRowIndex = rowsAfterUpdate.indexOf(movedRowSysId);

        // Get the before and after rows
        var previousRecordInList = movedRowIndex > 0 ? rowsAfterUpdate[movedRowIndex - 1] : null;
        var nextRecordInList = movedRowIndex < rowsAfterUpdate.length - 1 ? rowsAfterUpdate[movedRowIndex + 1] : null;

        blockcontext.previousRecordInList = previousRecordInList;
        blockcontext.nextRecordInList = nextRecordInList;
        blockcontext.movedRowSysId = movedRowSysId;
        await aceUtils.setContext(blockcontext);
        await aceUtils.refreshContentBlock("reorder_app_routes");
        eventPayload.listControllerRefreshRequested();
    } else if (eventName == "SOW_ADMIN_CENTER_LIST#ACTIVATE_BUTTON_CLICKED") {
        blockcontext.selectedRecords = eventPayload.listController.selectionProps.selectedRowIds;
        await aceUtils.setContext(blockcontext);
        await aceUtils.refreshContentBlock("activate_contextual_side_panels_data_block");
        let message = await helpers.translate("The selected contextual side panel(s) have been activated");
        blockcontext = await aceUtils.getContext();
        if (blockcontext.showActivateAlert == true) {
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": "positive",
                "icon": "info-circle-outline",
            });
        }
        eventPayload.setState("selectedRecords", []);
        eventPayload.listControllerRefreshRequested();
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
    } else if (eventName == "SOW_ADMIN_CENTER_LIST#DEACTIVATE_BUTTON_CLICKED") {
        blockcontext.selectedRecords = eventPayload.listController.selectionProps.selectedRowIds;
        await aceUtils.setContext(blockcontext);
        await aceUtils.refreshContentBlock("deactivate_contextual_side_panels_data_block");
        let message = await helpers.translate("The selected contextual side panel(s) have been deactivated");
        blockcontext = await aceUtils.getContext();
        if (blockcontext.showDeactivateAlert == true) {
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": "positive",
                "icon": "info-circle-outline",
            });
        }
        eventPayload.listControllerRefreshRequested();
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
    }
}
