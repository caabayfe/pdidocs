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
    api.emit("NAV_ITEM_SELECTED", {
        route: 'dashboard',
        reload: true,
        params: {
            'queue': api.state.state_queue_name,
            'event': api.state.state_event_name,
            'start': api.state.state_start_date,
            'end': api.state.state_end_date
        }
    });
}
