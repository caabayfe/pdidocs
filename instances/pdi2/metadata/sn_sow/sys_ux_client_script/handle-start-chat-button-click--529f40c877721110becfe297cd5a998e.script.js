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
    if (api.data.check_user_access_token_availability.output) {
        if (api.data.get_teams_channel_url.output && api.data.get_teams_channel_url.output.channelData && api.data.get_teams_channel_url.output.channelData.errorMsg) {
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
        } else if (api.data.get_teams_channel_url.output && api.data.get_teams_channel_url.output.channelData)
            api.emit("REDIRECT_TO_TEAMS_CHANNEL", {
                url: api.data.get_teams_channel_url.output.channelData
            });
        else if (api.state.requesterUserId === api.data.user_record.result._row_data.uniqueValue)
            api.data.get_teams_channel_url.refresh();
        else
            api.setState("requesterUserId", api.data.user_record.result._row_data.uniqueValue);
    } else {
        var fieldsObj = {
            sysId: api.context.props.recordSysId,
            table: api.context.props.table,
            descriptionField: "short_description",
            preSelectedParticipants: api.data.user_record.result._row_data.uniqueValue
        };
        api.emit('OPEN_START_CHAT_MODAL', {
            fieldsValues: fieldsObj
        });
    }
}
