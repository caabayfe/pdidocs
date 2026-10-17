/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var res = "0/0";
    if (api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin")) {
        var output = api?.data?.get_ia_info_1.output;
        if (output != undefined) {
            var apiCalls = output.apiCalls;
            var total = output.total;
            res = apiCalls + "/" + total;
        }
    }
    return res;
}
