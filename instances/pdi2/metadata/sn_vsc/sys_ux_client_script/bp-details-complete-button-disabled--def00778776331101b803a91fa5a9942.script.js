/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"))) {
        return true;
    }
    var bp_status = api.data.bp_details_form.form.fields.status.value;
    if (bp_status === 'completed') {
        return true;
    }
    return false;
}
