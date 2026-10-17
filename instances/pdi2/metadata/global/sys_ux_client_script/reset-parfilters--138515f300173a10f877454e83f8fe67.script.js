/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Because parFilters should not be put to client state
    api.setState("parFilters", api.state.defaultParFilters || null);
    api.setState("filterEncodedQuery", "");
}
