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
    var response = api.data.transform_execution_history_of_a_rule.output;
    api.setState("executionHistoryLength", response.count);
}
