/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let content = "";
    if (event.elementId == "get_comm_task_channel_details" && event.name == "DATA_FETCH_FAILED") {
        content = await helpers.translate("Communication channel(s) data fetch failed");
    } else if ((event.elementId == "send_comm_updates" && event.name == "DATA_OP_FAILED") || (event.elementId == 'send_dex_notification' && event.name == "DATA_OP_FAILED")) {
        content = await helpers.translate("Unable to send communication");
    } 

    let items = [{
        "action": {
            "type": "dismiss"
        },
        "content": content,
        "icon": "circle-close-outline",
        "id": `compose-communication-failed-error`,
        "status": "critical",
    }];

    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: items,
    });
}
