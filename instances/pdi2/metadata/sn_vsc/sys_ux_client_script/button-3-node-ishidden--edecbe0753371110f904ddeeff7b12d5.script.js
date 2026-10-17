/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var availableDate = api?.data?.get_all_score_dates_1?.output;
    if (availableDate && availableDate[0] && api?.state?.date2AppliedDisplay == availableDate[0].split(" ")[0] && (api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"))) {
        return false;
    } else {
        return true;
    }
}
