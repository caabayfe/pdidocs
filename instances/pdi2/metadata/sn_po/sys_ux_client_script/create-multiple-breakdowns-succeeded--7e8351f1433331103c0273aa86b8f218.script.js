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
    const {
        success,
        message,
        errorMessages
    } = event.payload.data.output.data.snPo.GlidePromin.createMultipleBreakdowns;

    if (!success) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-multiple-breakdowns-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }

    if (!errorMessages || errorMessages.length === 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-multiple-breakdowns-error',
                status: 'info',
                icon: 'circle-check-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
    } else {
        let messageContent = `<span><ul style="margin:0;margin-top:10px;margin-bottom:15px;padding-inline-start: 15px;">`;
        for (const error of errorMessages) {
            messageContent += `<li>${error}</li>`;
        }
        messageContent += '</ul></span>';
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-multiple-breakdowns-success',
                status: 'info',
                icon: 'circle-info-outline',
                content: {
                    type: 'html',
                    value: messageContent,
                },
                action: {
                    type: 'dismiss'
                },
            }],
        });
        if (message) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'save-multiple-breakdowns-error',
                    status: 'info',
                    icon: 'circle-check-outline',
                    content: message,
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }
    }


    api.setState('breakdownsListRefreshState', {
        timestamp: Date.now(),
        background: false,
    });
    api.setState('breakdownsListSelectedRecords', []);
    api.data.get_project_entities.refresh();
}
