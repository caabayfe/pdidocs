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
    api.setState("searchTerm", "");
    api.setState("rowData", {});
    api.setState("totalRecords", 0);
    api.setState("pageIdx", 0);
    api.setState("colData", {});
}
