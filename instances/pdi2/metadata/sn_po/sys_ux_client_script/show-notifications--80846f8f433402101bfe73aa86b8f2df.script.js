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
    const {
        type: status,
        message,
        extra,
        header,
        icon,
    } = event.payload.notifications;

    const statusIconMap = {
        info: 'circle-info-outline',
        positive: 'circle-check-outline',
        critical: 'exclamation-triangle-outline',
    };

    // If notifications payload has header, skip presenting messages as a list
    if (header) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'rule-based-finding-error-with-header',
                status: status,
                icon: icon || statusIconMap[status],
                content: {
                    type: 'html',
                    value: `<span><b>${header}</b> ${message}`,
                },
                action: {
                    type: 'dismiss'
                },
            }]
        });
        return;
    }

    const errorMessages = message.split(',');
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
