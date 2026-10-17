/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.get_bp_steps_completed.output) {
        api.setState("outstandingSteps", api.data.get_bp_steps_completed.output.outstandingSteps);
    }
}
