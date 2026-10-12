/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var prev_score = api.data.sc_get_summary_score_details__1.output[0].prevScore;
    if (prev_score) {
        return prev_score;
    } else {
        return '';
    }
}
