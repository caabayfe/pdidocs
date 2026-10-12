/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var change_from_prev = api.data.sc_get_summary_score_details__1.output[0].changeFromPrev;
    if (change_from_prev) {
        return change_from_prev + "%";
    } else {
        return 0;
    }

}
