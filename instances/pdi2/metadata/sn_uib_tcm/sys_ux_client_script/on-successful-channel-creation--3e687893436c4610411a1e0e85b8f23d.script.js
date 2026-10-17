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
    const data = event.payload.data;
    const channelTable = api.state.channelTable;
    let ICT = data["output"]["data"]["GlideRecord_Mutation"][`insert_${channelTable}`]["comm_task"]["displayValue"];
    let message = await helpers.translate("Successfully added channel to {0}  ", [ICT]);
    api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
    api.setState("showLoader", false);
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        "items": [{
            "id": "channel-success-message",
            "action": {
                "type": "dismiss"
            },
            "content": message,
            "status": "positive",
            "icon": "circle-exclamation-outline"
        }]
    });
    helpers.modal.close();
}
