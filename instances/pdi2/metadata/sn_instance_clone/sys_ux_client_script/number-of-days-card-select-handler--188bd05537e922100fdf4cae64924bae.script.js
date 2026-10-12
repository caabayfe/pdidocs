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
    api.setState('preserve_in_progress_update_sets', event.payload.value);
    api.setState('preserveInProgressGlobalUpdateSetsSummaryValue', event.payload.item.label);
}
