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
    var isFavorite = event.payload.value;
    api.setState('isFavorite', isFavorite);
     let tooltipText = isFavorite ? 'Remove from favorites' : 'Mark as favorite';
        helpers.translate(tooltipText).then((translatedTooltip) => {
            api.setState('favoriteTooltip', translatedTooltip);
        });
    api.setState('favoriteToggled', true);
    api.data.update_conversation.execute({
        table: "sn_ci_analytics_cs_details",
        recordId: api.state.conversationDetails.id,
        templateFields: 'favorite=' + isFavorite,
        useSetDisplayValue: false
    });
}
