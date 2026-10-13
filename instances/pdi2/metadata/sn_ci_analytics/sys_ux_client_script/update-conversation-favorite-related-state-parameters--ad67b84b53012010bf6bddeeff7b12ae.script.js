/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const output = api.data.fetch_conversation_detail.output || {};
    const isFavorite = output && output.IsFavorite;
    const localeOutput = api.data.page_locale_parser_1.output || {};
    let tooltipText = isFavorite ? localeOutput.removeFavorite : localeOutput.addFavorite;
    if (event.name === "NOW_BUTTON_STATEFUL#SELECTED_SET") { //set parameters for data broker
        api.setState("conversationIdForFavorite", api.state.conversationId);
        const userId = output.UserId && output.UserId.$oid || '';
        api.setState("userId", userId);
        const newFavoriteValue = event.payload && event.payload.value;
        api.setState("isFavorite", newFavoriteValue);
        tooltipText = newFavoriteValue ? localeOutput.removeFavorite : localeOutput.addFavorite;
    }  
    api.setState("favoriteTooltip", tooltipText);
}
