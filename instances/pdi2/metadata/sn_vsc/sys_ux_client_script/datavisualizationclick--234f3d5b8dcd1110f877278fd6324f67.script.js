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
    var query = event.payload.params.query;
    var baseQuery = api.state.listQuery;
    if (query) {
        if (baseQuery) {
            // remove the query that should already be a part of the filter
            query = query.replaceAll(baseQuery, '');
        }
        api.setState("dataVizQuery", query);
    }
}
