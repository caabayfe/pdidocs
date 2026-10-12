/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const scoreSummary = api.state.kpiScoreSummary;
    if (scoreSummary && scoreSummary.score && scoreSummary.formattedScore)
        return scoreSummary.formattedScore;

    return helpers.translateSync('No scores');
}
