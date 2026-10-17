/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
        let translatedLabels = api.state.translatedLabels;
        let resultLabel = api.state.currentTabs.find((element) => element.id == api.state.selectedMetric).resultsLabel;
    return `${api.state.selectedLabel}${resultLabel} (${translatedLabels.TOP_TEN})`;
}
