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
        route: 'home',
        reload: true,
        params: {
            'selectedTab': 'id=scheduled_jobs',
            'job': api.state.job_classification,
            'priority': api.state.priority,
            'rangestart': api.state.time_range_start,
            'rangeend': api.state.time_range_end
        }
    });
}
