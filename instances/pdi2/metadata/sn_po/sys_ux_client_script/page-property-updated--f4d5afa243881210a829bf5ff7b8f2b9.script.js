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
    if (event.payload.name == 'activeTab' && event.payload.value != '') {
        api.setState('activeTab', event.payload.value);
        api.emit("CONTENT_UPDATED", {
            params: {
                activeTab: '',
            }
        });
    }
}
