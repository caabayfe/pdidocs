/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  const {
        type: status,
        message,
        extra,
        source,
    } = event.payload.notifications;

    const statusIconMap = {
        info: 'circle-info-outline',
        positive: 'circle-check-outline',
        critical: 'circle-exclamation-outline',
        warning: 'triangle-exclamation-outline',
        moderate: 'circle-info-outline',
        ai: 'ai-sparkle-outline',
    };

    if (source === 'IMPORT_IMPROVEMENT_OPPORTUNITY') {
        const allMessages = message;
        
        if (allMessages.length === 1) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'import-improvement-opportunities-'+status,
                    status: status,
                    icon: statusIconMap[status],
                    content: {
                        type: 'html',
                        value: allMessages[0],
                    },
                    action: {
                        type: 'dismiss'
                    },
                }]
            });
        } else if (allMessages.length > 1) {
            let messageContent = `<span>${allMessages[0]}<ul style="margin:0;margin-top:10px;margin-bottom:15px;padding-inline-start: 15px;">`;
            for (let i = 1; i < allMessages.length; i += 1) {
                messageContent += `<li>${allMessages[i]}</li>`;
            }
            messageContent += '</ul></span>';
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'import-improvement-opportunities-'+status,
                    status: status,
                    icon: statusIconMap[status],
                    content: {
                        type: 'html',
                        value: messageContent,
                    },
                    action: {
                        type: 'dismiss'
                    },
                }]
            });
        }
        return;
    } else if (source === 'TOUCHPOINT_ANALYSIS') {
        if (api.state.touchpointUpdateNotificationShown) {
            return;
        }
        const [content] = message;
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'touchpoint-analysis-updated-alert',
                status: status,
                icon: statusIconMap[status],
                content: {
                    type: 'html',
                    value: content,
                },
                action: {
                    type: 'dismiss'
                },
            }]
        });
        api.setState('touchpointUpdateNotificationShown', true);

        return;
    } else if (source === 'IDLE_TIME_ANALYSIS') {
        if (api.state.idleTimeUpdateNotificationShown) {
            return;
        }
        const [content] = message;
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'idle-time-analysis-updated-alert',
                status: status,
                icon: statusIconMap[status],
                content: {
                    type: 'html',
                    value: content,
                },
                action: {
                    type: 'dismiss'
                },
            }]
        });

        api.setState('idleTimeUpdateNotificationShown', true);

        return;
    }

    const errorMessages = message;
    let messageContent = `<span><ul style="margin:0;margin-top:10px;margin-bottom:15px;padding-inline-start: 15px;">`;
    for (const error of errorMessages) {
        messageContent += `<li>${error}</li>`;
    }
    messageContent += '</ul></span>';
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'cancel-mining-error',
            status: status,
            icon: statusIconMap[status],
            content: {
                type: 'html',
                value: errorMessages.length > 1 ?  messageContent : errorMessages[0] ,
            },
            action: {
                type: 'dismiss'
            },
        }]
    });
}
