/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */

function evaluateProperty({
    api,
    helpers
}) {
    let title = "";
    if (api.state.confDetails && api.state.confDetails.title && api.state.confDetails.title.original)
        title = helpers.translateSync("Card: {0}", api.state.confDetails.title.original);
    return {
        "article": {
            "aria-label": title
        }
    };
}
