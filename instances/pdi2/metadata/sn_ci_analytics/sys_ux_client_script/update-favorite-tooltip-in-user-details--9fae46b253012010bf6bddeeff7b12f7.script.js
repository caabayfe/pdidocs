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
    const output = api.data.analytics_user_detail_1.output || {};
    const isFavorite = output && output.IsFavorite;
    const localeOutput = api.data.page_locale_parser_1.output || {};
    const hashedUserId = output && output.AppUserId || localeOutput.anonymous;
    const userName = output && output.user_name || localeOutput.anonymous;
    let tooltipText = isFavorite ? localeOutput.removeFavorite : localeOutput.addFavorite;
    if (event.name === "NOW_BUTTON_STATEFUL#SELECTED_SET") {
        const newValue = event.payload && event.payload.value;
        tooltipText = newValue ? localeOutput.removeFavorite : localeOutput.addFavorite;
    }
    api.setState("favoriteTooltip", tooltipText);
    api.setState("hashedUserId", hashedUserId);
    api.setState("userName", userName);
}
