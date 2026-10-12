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
    api.setState('typeaheadValue','');
    api.setState("showRequestForm", true);
    api.setState("showSummaryForm", false);
}
