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
    //This will update the state parameter with the list of selected records from the 'Unmapped global custom tables' list
    api.setState('selectedRecommendationRecords', event.payload.selectedRecords);
}
