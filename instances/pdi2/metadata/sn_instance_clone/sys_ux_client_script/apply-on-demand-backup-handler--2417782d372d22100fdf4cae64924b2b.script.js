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
    api.setState('on_demand_backup', event.payload.value);
    api.setState('onDemandBackupSummaryValue', event.payload.value == true ? api.state.text.Yes : api.state.text.No);
}
