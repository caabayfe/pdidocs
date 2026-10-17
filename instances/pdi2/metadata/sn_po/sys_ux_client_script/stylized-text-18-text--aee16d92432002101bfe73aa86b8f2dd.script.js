/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        totalFindingsCount,
        ruleBasedFindingsCount,
        automatedFindingsCount
    } = api.state;

    return helpers.translateSync('Total applied: {0} • Rule based: {1} • Automated: {2}', totalFindingsCount, ruleBasedFindingsCount, automatedFindingsCount);
}
