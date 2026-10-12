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
    const eventName = event.name;
    if (eventName == "NOW_RECORD_LIST_CONNECTED#INLINE_EDITING_VALIDATE_UPDATE_RECORDS_COMPLETED" || eventName == "NOW_RECORD_LIST_CONNECTED#DA_SCRIPT_SUCCEEDED") {
        api.setState('isFirstLoad', true);
        var query = 'active=true';
        var filter = api.state.filter;
        if (filter && JSON.parse(filter)) {
            filter = JSON.parse(filter);
            if (filter.encodedQueries && filter.encodedQueries.incident) {
                query = '';
            }
        }
        api.setState('filter', () => JSON.stringify({
            encodedQueries: {
                incident: query
            }
        }));
        if (eventName == "NOW_RECORD_LIST_CONNECTED#INLINE_EDITING_VALIDATE_UPDATE_RECORDS_COMPLETED") {

            api.setState('listRefreshRequested', {
                timestamp: new Date().getTime()
            });
        }
    }
}
