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
    try {
        const message = await helpers.translate(
            '<b>Link to Destination</b> The provided link will be opened.'
        );
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                type: 'html',
                message: message
            }]
        });
    } catch (err) {
        console.error(err);
    }
}
