/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const assetCount = (api.state.aggregatedCounts.asset_count === "--") ? 0 : api.state.aggregatedCounts.asset_count;
    const ariaProps = {
        "button": {
            "aria-label": helpers.translateSync("Assets count {0}, press enter to load list", assetCount)
        }
    };
    return ariaProps;
}
