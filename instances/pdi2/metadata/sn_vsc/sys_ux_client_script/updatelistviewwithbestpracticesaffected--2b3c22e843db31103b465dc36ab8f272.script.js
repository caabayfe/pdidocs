/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.bestPracticesAffectedData) {
        api.setState("filterQuery" , api.data.get_updates_information_on_the_best_practices.output.encodedQueryForAffectedBestPractices);
    }
}
