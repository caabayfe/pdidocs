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
    const errorMessage = await helpers.translate('Failed to initiate Refresh impacted services');
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            type: 'error',
            message: errorMessage
        }]
    });
}
