/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var res = api?.data?.get_updates_information_on_the_best_practices;
    if (res && res.output) {
        api.setState("bestPracticesAffectedData", res.output);
    }
}
