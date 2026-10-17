/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let { startDate, endDate, encodedQuery } = event.payload;
    var params = {
        startDate: startDate,
        endDate: endDate,
        encodedQuery: encodedQuery
    };
    helpers.navigate.setRouteParams({
        params
    });
}
