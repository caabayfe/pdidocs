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
    api.setState('breakdownsCount', event.payload.model.layoutQuery.allSysIds.length);
    const entityBreakdownsList = event.payload.model.layoutQuery.queryRows;
    const entityBreakdowns = [];
    for (const [key, value] of entityBreakdownsList) {
        entityBreakdowns.push(value.displayValue);
    }
    api.setState('entityBreakdowns', entityBreakdowns);
    api.data.get_process_configuration.execute({table: api.state.selectedEntity.table.value});
}
