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
    api.setState('currentView', {
        params: {},
        view: api.state.VIEWS.BREAKDOWNS_LIST,
    });
    api.setState('breakdownsListSelectedRecords', []);
}
