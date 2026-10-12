/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.sc_get_summary_score_details__1.output[0].updatedSettings == "0") {
        return true;
    } else {
        return false;
    }
}
