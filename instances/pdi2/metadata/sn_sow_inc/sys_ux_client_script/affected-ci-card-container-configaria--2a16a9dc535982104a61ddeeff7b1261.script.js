/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const affectedCiCount = (api.state.aggregatedCounts.affected_ci_count === "--") ? 0 : api.state.aggregatedCounts.affected_ci_count;
    const ariaProps = {
        "button": {
            "aria-label": helpers.translateSync("Affected CIs count {0}, press enter to load list", affectedCiCount)
        }
    };
    return ariaProps;
}
