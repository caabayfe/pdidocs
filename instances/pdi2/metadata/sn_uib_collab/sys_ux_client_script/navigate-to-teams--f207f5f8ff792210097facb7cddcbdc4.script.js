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
    if (api.data.channel_redirect_utils.output && api.data.channel_redirect_utils.output.channelData && api.data.channel_redirect_utils.output.channelData.errorMsg) {
        var payload = {};
        payload.notificationPayload = {
            "items": [{
                "id": "teams-error-message",
                "action": {
                    "type": "dismiss"
                },
                "content": api.data.channel_redirect_utils.output.channelData.errorMsg + '',
                "status": "critical",
            }]
        };
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', payload.notificationPayload);
    } else if (api.data.channel_redirect_utils.output) {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: api.data.channel_redirect_utils.output.channelData[0].url
            }
        });

        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Start Chat",
            value: {
                source: "MS Teams"
            }
        });
    }
}
