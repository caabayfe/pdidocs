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
    var SOWListContextActionHandler = imports['sn_sow.SOWListContextActionHandler'](api, event, helpers);
    var recordSysId = SOWListContextActionHandler.getRecordSysId(event.payload.context.row.key);
    if (!SOWListContextActionHandler.checkIfActionRequireAccess(event.payload.actionItem.id)) {
        SOWListContextActionHandler.invokeContextActionHandler(recordSysId, event.payload.actionItem.id);
    } else {
        // update contextActionObj state to refresh data broker
        api.setState("contextActionObj", {
            "table": api.data.list_controller.current.table,
            "sysId": recordSysId,
            "actionId": event.payload.actionItem.id
        });
    }
}
