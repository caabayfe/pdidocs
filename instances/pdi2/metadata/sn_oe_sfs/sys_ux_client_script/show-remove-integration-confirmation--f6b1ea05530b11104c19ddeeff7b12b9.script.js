/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {name,
            payload: {
                eventName,
                eventPayload
            }
        } = event;

    console.log(eventPayload.loading);
    const event_name = "ACE_ACTION_PERFORMED#REMOVE_INTEGRATION";
    const botName = eventPayload.botName;
    
    if(eventName==event_name && eventPayload.loading) {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });
    }

    if(eventName==event_name && !eventPayload.loading) {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: false,
        });

        if(eventPayload.success === true) {
            if (api.context.props.channel == 'messenger' || api.context.props.channel == 'line') {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'alert5',
                        status: 'positive',
                        icon: 'info-circle-outline',
                        content: `'${botName}' was successfully removed.`,
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });

            } else {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'alert5',
                        status: 'info',
                        icon: 'info-circle-outline',
                        content: `Integration with '${botName}' bot is removed successfully.`,
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
            }
        } else if (eventPayload.success === false) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'critical',
                    icon: 'exclamation-triangle-outline',
                    content: `Error: Failed to remove integration with ${botName} bot.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }   
    }
}
