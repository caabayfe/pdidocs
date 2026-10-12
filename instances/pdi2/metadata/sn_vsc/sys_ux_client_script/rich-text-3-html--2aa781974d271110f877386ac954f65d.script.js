/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var updatedSettings = api.data.sc_get_summary_score_details__1.output[0].updatedSettings;
    if (updatedSettings) {
        return updatedSettings;
    }
    return 0;
}
