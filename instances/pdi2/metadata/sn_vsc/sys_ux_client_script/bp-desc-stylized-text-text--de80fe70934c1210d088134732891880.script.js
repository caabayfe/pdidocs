/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api?.data?.get_bp_info?.output?.completed + '/' + api?.data?.get_bp_info?.output?.total;
}
