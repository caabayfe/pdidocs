/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const channel_type = api.context.props.payload.pageParams.channel;
    const inbound_id = api.state.inboundID;
    const bot_name = api.state.botName;
    const type = api.state.integrationType;
    const event_name = "ACE_ACTION_PERFORMED_RELAY_3f1d0663a39a511079f66bcf26fcda44";
    const name = "ACE_ACTION_PERFORMED#REMOVE_INTEGRATION";

    api.emit(event_name, {
        eventName: name,
        eventPayload: {
            loading: true,
            success: false,
            botName: bot_name
        }
    });

    if(inbound_id && channel_type == "teams") {
        helpers.snHttp(`/api/now/va_teams_bot_uninstall/bot_uninstall/${inbound_id}`, {method: 'GET'})
        .then(({response}) => {
            if(response.result.success) {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: true,
                    botName: bot_name}
                });
            api.data.look_up_records_1.refresh();
            api.data.look_up_records_2.refresh();
            } else {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: false,
                    botName: bot_name}
                });
            }
        })
        .catch(({error}) => {
            const message = `${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

    
    if (inbound_id && channel_type == "slack" && type == 'oob_remove_integration') {
        helpers.snHttp(`/api/now/va_bot_uninstall/${channel_type}/${inbound_id}`, {method: 'GET'})
        .then(({response}) => {
            api.emit(event_name, {
                eventName: name,
                eventPayload: {loading: false,
                botName: bot_name}
            });
            api.data.look_up_records_4.refresh();
            api.emit("NAV_ITEM_SELECTED", {
                external: {
                    url: response.result
                }
            });  
        })
        .catch(({error}) => {
            api.emit(event_name, {
                eventName: name,
                eventPayload: {loading: false,
                success: false,
                botName: bot_name}
            });
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }
    
    if (inbound_id && channel_type == "slack" && type == 'custom_remove_integration') {
        helpers.snHttp(encodeURI(`/api/sn_va_slack/va_slack_custom_bot_uninstall/${bot_name}/${inbound_id}`), {method: 'GET'})
        .then(({response}) => {
            if(response.result.error) {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: false,
                    botName: bot_name}
                });
            } else {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: true,
                    botName: bot_name}
                });
                api.data.look_up_records_5.refresh();
            }
        })
        .catch(({error}) => {
            api.emit(event_name, {
                eventName: name,
                eventPayload: {loading: false,
                success: false,
                botName: bot_name}
            });
            
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

    if (inbound_id && channel_type == "messenger" && type == 'custom_remove_integration') {
        helpers.snHttp('/api/sn_va_fb_messenger/_fb_messenger_custom_bot_integration/uninstall_bot', {method: 'POST',batch: true, body: {'bot_name': bot_name,'inbound_id':inbound_id}})
        .then(({response}) => {
            if(response.result.error) {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: false,
                    botName: bot_name}
                });
            } else {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: true,
                    botName: bot_name}
                });
                api.data.look_up_records_6.refresh();
            }
        })
        .catch(({error}) => {
            api.emit(event_name, {
                eventName: name,
                eventPayload: {loading: false,
                success: false,
                botName: bot_name}
            });
            
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

    if (inbound_id && channel_type == "line" && type == 'custom_remove_integration') {
        helpers.snHttp('/api/sn_va_line/_line_messenger_custom_bot_integration/uninstall_bot', {method: 'POST',batch: true, body: {'bot_name': bot_name}})
        .then(({response}) => {
            if(response.result.error) {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: false,
                    botName: bot_name}
                });
            } else {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: true,
                    botName: bot_name}
                });
                api.data.look_up_records_7.refresh();
            }
        })
        .catch(({error}) => {
            api.emit(event_name, {
                eventName: name,
                eventPayload: {loading: false,
                success: false,
                botName: bot_name}
            });
            
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

    if(inbound_id && channel_type == "google-chat") {
        helpers.snHttp(`/api/sn_va_google_chat/google_chat_bot_uninstall/bot_uninstall/${inbound_id}`, {method: 'GET'})
        .then(success => {
            if(success) {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: true,
                    botName: bot_name}
                });
            api.data.google_chat_lookup_records.refresh();
            } else {
                api.emit(event_name, {
                    eventName: name,
                    eventPayload: {loading: false,
                    success: false,
                    botName: bot_name}
                });
            }
        })
        .catch(({error}) => {
            const message = `${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

}
