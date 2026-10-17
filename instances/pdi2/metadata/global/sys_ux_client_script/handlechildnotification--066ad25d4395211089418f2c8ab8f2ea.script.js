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
        items
    } = event.payload;
    
    api.emit("SCHEDULE#DATE_RANGE_UPDATED");
    api.emit('SCHEDULE#ADD_NOTIFICATION', {
        items
    });
}
