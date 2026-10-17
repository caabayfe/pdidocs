/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const searchTeaserText = api.state.searchTeaserText;
    if ((searchTeaserText && searchTeaserText.length === 0) || !searchTeaserText || searchTeaserText === 'null' || searchTeaserText === 'undefined') {
        return true;
    }
    return false;
}
