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
                id: 'approvalDecisionFail',
                status: 'warning',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('Your approval decision has not been submitted. Please try again'),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    };
    sendNotification();
}
