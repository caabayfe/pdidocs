/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedRowsCount == 0)
        return true;
    if (api.context.session.user.roles.includes('admin') || (api.context.session.user.roles.includes('sn_sd.success_dashboard_admin') && api.data.get_user_access_on_sys_user_has_role_1.output.canDelete))
        return false;
    return true;
}
