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
    var sysPropResult = api.data.look_up_for_number_of_interactions.result;
    var numberOfInteractions = sysPropResult.value.value;
    api.setState("number_of_interactions", numberOfInteractions);
}
