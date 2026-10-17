/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.get_all_score_dates_1.output.length > 1) {
        return false;
    } else {
        return true;
    }
}
