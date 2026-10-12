/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.replacementArticlesList) {
        return api.state.replacementArticlesList;
    }

    return [];
}
