/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var res = api.data.vsc_get_score_trend_start_date_1.output[0];
    if (res) {
        return res.startDate;
    }
    return res.endDate;
}
