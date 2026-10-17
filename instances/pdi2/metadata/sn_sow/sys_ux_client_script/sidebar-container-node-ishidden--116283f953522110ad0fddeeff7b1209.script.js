/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let userIsLoggedInUser = api.context.session.user.sys_id == api.context.props.userSysId;
    let doesUserHaveReadAccess = (api.data.check_sidebar_user_permission.output && api.data.check_sidebar_user_permission.output.hasReadAcccess);
    let isSidebarSupported = (api.data.check_sidebar_user_permission.output && api.data.check_sidebar_user_permission.output.isSidebarSupportedOnSOW);
    let doesUserHaveWriteAccess = (api.data.check_sidebar_user_permission.output && api.data.check_sidebar_user_permission.output.hasRecordWriteAccess);
    if (userIsLoggedInUser || !doesUserHaveReadAccess || !isSidebarSupported || !doesUserHaveWriteAccess)
        return true;
    return false;
}
