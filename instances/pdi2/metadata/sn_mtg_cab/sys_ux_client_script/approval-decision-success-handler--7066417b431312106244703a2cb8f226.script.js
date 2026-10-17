/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sendNotification = async () => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'approvalDecisionSuccess',
                status: 'info',
                icon: 'check-circle-outline',
                content: await helpers.translate('Your approval decision has been submitted to {0}', api.state.currentAgendaItem.task.record.number.display_value),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    };
    sendNotification();
}
