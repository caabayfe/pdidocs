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
    if (event.name == "SN_TCM_EMAIL_COMPOSE#ADD_ALERT") {
        var notifyItems = event.payload.items;
        var items = [];
        for (let i = 0; i < notifyItems.length; i++) {
            if (notifyItems[i].status != 'positive') {
                items.push(notifyItems[i]);
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: items
                });
            }

        }
    } else if (event.name == 'SN_TCM_EMAIL_COMPOSE#DRAFT_SEND_SUCCEEDED') {
        const channelsPayload = { ...api.state.channelsPayload
        };
        if (channelsPayload['dex_desktop_assistant'] && channelsPayload['email']) {
            api.setState('emailResponse', true);
            if (api.state.dexResponse) {
                api.data.send_comm_updates.
                execute({
                    "commTaskSysId": api.context.props.sysId,
                    "table": api.context.props.table,
                    "payload": JSON.stringify(api.state.channelsPayload)
                });
                api.setState('dexResponse', false);
                api.setState('emailResponse', false);
            }
        } else {
            api.data.send_comm_updates.
            execute({
                "commTaskSysId": api.context.props.sysId,
                "table": api.context.props.table,
                "payload": JSON.stringify(api.state.channelsPayload)
            });
        }

    }
}
