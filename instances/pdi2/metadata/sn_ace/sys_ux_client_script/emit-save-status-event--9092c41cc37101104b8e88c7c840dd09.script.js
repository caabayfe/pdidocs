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
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'aggr-card-save-success',
            status: 'info',
            icon: 'info-circle-outline',
            content: 'Saved Successfully!',
            action: {
                type: 'dismiss'
            }
        }]
    });
}
