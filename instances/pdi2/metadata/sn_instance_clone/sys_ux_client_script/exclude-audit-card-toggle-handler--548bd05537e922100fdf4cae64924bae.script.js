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
    api.setState('userHasInteracted', true);
    api.setState('exclude_large_data', event.payload.value);
    api.setState('excludeAuditAndLogDataSummaryValue', event.payload.value == true ? api.state.text.Yes : api.state.text.No);
}
