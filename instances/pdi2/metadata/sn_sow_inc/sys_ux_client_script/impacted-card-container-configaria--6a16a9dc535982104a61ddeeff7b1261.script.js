/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const impactedCiCount = (api.state.aggregatedCounts.impacted_ci_count === "--") ? 0 : api.state.aggregatedCounts.impacted_ci_count;
    const ariaProps = {
        "button": {
            "aria-label": helpers.translateSync("Impacted services or CIs count {0}, press enter to load list", impactedCiCount)
        }
    };
    return ariaProps;
}
