/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const communicationDetailsTaskFilterUtil = imports["sn_uib_tcm.CommunicationDetailsTaskFilterUtil"]();
    const elementId = event.elementId;
    switch (elementId) {
        case "comm_task_watcher":
            communicationDetailsTaskFilterUtil.emitRecordWatcherMessage(api, event, "comm_task", null);
            break;
        case "comm_plan_watcher":
            communicationDetailsTaskFilterUtil.emitRecordWatcherMessage(api, event, "comm_plan", null);
            break;
        case "comm_channel_watcher":
            communicationDetailsTaskFilterUtil.emitRecordWatcherMessage(api, event, "comm_channel", null);
            break;
        default:
            //Do nothing
            break;
    }
}
