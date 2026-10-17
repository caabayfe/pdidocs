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

    const messageContent = message || await helpers.translate('Could not create breakdown fields');

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'save-multiple-breakdowns-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: messageContent,
            action: {
                type: 'dismiss'
            },
        }],
    });
}
