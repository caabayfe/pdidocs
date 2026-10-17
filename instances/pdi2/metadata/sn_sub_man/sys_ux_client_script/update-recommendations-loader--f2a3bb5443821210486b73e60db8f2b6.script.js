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
    api.setState('recommendationsBeingProcessed', false);
    helpers.timing.setTimeout(() => {
        api.data.unallocated_group_recommendation.refresh();
    }, 2000);




}
