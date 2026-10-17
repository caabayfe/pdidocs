/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.action.operation === "create_config_metrics" ||
    event.payload.action.operation === "review_process_configuration") {
        helpers.navigate.to('process-configuration-details', {
            processId: api.state.processId,
            step: 'impact-metrics'
        }, null, true);
    }
}
