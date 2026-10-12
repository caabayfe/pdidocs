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
    const recordsBeingProcessed = api.state.recommendationsBeingProcessed;
    if (recordsBeingProcessed) {
        api.setState('hideNoRecommendationsMsg', true);
        api.setState('hideRecommendationsList', true);
    } else {
        const recommendationsListCount = api.data.unallocated_group_recommendation.output.data.GlideAggregate_Query[0].count;
        const hideGroupRecommendationsList = typeof recommendationsListCount !== 'undefined' && recommendationsListCount == 0;
        const hideMsg = !hideGroupRecommendationsList;
        //HIde recommendations list if there are no recommendations
        api.setState('hideRecommendationsList', hideGroupRecommendationsList);
        //display no recommendations message if no recommedations
        api.setState('hideNoRecommendationsMsg', hideMsg);
        api.setState('hideRecommendationsLoader', true);
    }
}
