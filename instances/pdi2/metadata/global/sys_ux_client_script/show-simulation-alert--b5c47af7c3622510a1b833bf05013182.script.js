/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.look_up_simulations.results.length === 0 && api.data.look_up_tuned_model.results.length > 0 && api.state.result.tableName === 'incident' && !api.state.result.active) {
        api.setState('hideAlert', false);
    }
}
