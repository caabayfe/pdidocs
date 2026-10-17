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
    var notificationResponse = api.data.send_dex_notification.output.notificationResponse;
    async function showError(message) {
        var content = await helpers.translate(message);
        var items = [{
            "action": {
                "type": "dismiss"
            },
            "content": content,
            "icon": "circle-close-outline",
            "id": `comm-task-message`,
            "status": "critical",
        }];
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: items,
        });
    };
    if (notificationResponse && notificationResponse.metadata && notificationResponse.metadata.notificationID) {
        const result = api.data.get_comm_task_channel_details.output.data;
        var channelsPayload = { ...api.state.channelsPayload
        };
        if (channelsPayload['dex_desktop_assistant'] && channelsPayload['email']) {
            api.setState('dexResponse', true);
            if (api.state.emailResponse) {
                api.data.send_comm_updates.
                execute({
                    "commTaskSysId": api.context.props.sysId,
                    "table": api.context.props.table,
                    "payload": JSON.stringify(channelsPayload)
                });
                api.setState('emailResponse', false);
                api.setState('dexResponse', false);
            }
        } else {
            api.data.send_comm_updates.
            execute({
                "commTaskSysId": api.context.props.sysId,
                "table": api.context.props.table,
                "payload": JSON.stringify(channelsPayload)
            });
        }
    } else {
        showError(notificationResponse.message);
    }

}
