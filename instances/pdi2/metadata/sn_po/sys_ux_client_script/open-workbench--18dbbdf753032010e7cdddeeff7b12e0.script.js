/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState('initial_view', event.payload.view);
    api.setState('compare_mode_on', false);
    api.emit("CONTENT_UPDATED", {
        params: {
            selectedTabIndex: '2'
        }
    });
}
