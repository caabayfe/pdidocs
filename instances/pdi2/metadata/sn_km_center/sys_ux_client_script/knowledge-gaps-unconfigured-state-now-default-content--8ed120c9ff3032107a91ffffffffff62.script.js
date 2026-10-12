/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const roles = api.context.session.user.roles || [];
    const hasAdminRole = roles.includes('sn_nowassist_admin.nsa_admin');

    const noAccessToAllTaskTypes = (api.state.gapTaskTypeData || []).every(item => !item.canRead);
    if (noAccessToAllTaskTypes) {
        return helpers.translateSync("Please contact your administrator for access");
    }

    if (hasAdminRole) {
        return '';
    }

    return helpers.translateSync("Please contact your administrator for access");
}
