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
    if (event.name === "NOW_TYPEAHEAD#VALUE_SET") {
        api.setState("searchQueryTypeAhead", event.payload.value);
    } else if (event.name === "NOW_TYPEAHEAD_MULTI#VALUE_SET") {
        api.setState("searchQueryTypeAheadMulti", event.payload.value);
    }
    api.setState("inputSearchQuery", event.payload.value);
}
