/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var searchStr = api.state.availableTabConfig.searchStr || "";
    return `123TEXTQUERY321=${searchStr}`;
}
