/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // The Create task button should only be visible if it is a scan finding record and it is not a new record. It should only be seen by users with "sc admin" role
    if (api.context.props.table == "scan_finding" && api?.context?.props?.sysId != "-1" && (api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"))) {
        return false;
    } else {
        return true;
    }
}
