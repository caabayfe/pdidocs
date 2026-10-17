/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var tool_title = api?.item?.value?.title;
    // hide scripting governance for non security_admin users
    if (tool_title == helpers.translateSync("Scripting governance for default group")) {
        return api?.data?.get_iam_card_data?.output?.hideGovCard;
    } else if (tool_title == helpers.translateSync("Customer actions") && !(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"))) {
        return true; // hide customer actions for non admin users
    }
    return false;
}
