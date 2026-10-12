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
    var value = api.state.selected_events_tab ? api.state.selected_events_tab : "scores";
    api.emit("NAV_ITEM_SELECTED", {
        route: 'home',
        reload: true,
        params: {
            'selectedTab': 'id=system_event_monitoring_' + value
        }
    });
}
