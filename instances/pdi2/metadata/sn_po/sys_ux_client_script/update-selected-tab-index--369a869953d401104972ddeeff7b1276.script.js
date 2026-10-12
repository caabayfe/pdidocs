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

    api.emit('SCREEN_STATUS_CHANGED', {
        title: api.state.header_data.primary
    });

    api.emit("CONTENT_UPDATED", {
        params: {
            selectedTabIndex: (event.payload.selectedTabIndex || 0) + ''
        }
    });
}
