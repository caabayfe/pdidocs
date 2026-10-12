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
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'advanced-condition-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: await helpers.translate('An error occured when saving entity'),
            action: {
                type: 'dismiss'
            },
        }],
    });
}
