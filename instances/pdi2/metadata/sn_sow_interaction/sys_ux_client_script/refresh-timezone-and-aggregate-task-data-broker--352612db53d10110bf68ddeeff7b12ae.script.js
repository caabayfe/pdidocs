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
    const lookupResponse = api.data.lp_record.result;
    if (api.state.openedForSysId !== "-1" && lookupResponse) {
        api.setState("userTimezone", (lookupResponse.time_zone && lookupResponse.time_zone.displayValue));
        api.setState('taskQuery', (api.data.get_task_aggregation_query.output && api.data.get_task_aggregation_query.output.taskQuery));
    }
}
