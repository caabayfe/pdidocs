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

    api.setState('activitiesListRefreshState', {
        timestamp: Date.now(),
        background: false,
    });
    api.setState('activitiesListSelectedRecords', []);
    api.setState('breakdownsListRefreshState', {
        timestamp: Date.now(),
        background: false,
    });
    api.setState('breakdownsListSelectedRecords', []);
    api.data.get_project_entities.refresh();
}
