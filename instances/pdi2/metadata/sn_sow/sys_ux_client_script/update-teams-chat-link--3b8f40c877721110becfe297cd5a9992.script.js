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
    if (api.data.get_teams_channel_url.output && api.data.get_teams_channel_url.output.channelData) {
        if (api.data.get_teams_channel_url.output.channelData.errorMsg) {
            var payload = {};
            payload.notificationPayload = {
                "items": [{
                    "id": "teams-error-message",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": api.data.get_teams_channel_url.output.channelData.errorMsg + '',
                    "status": "critical",
                }]
            };
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', payload.notificationPayload);
        } else {
            api.emit("REDIRECT_TO_TEAMS_CHANNEL", {
                url: api.data.get_teams_channel_url.output.channelData
            });
        }
    }
}
