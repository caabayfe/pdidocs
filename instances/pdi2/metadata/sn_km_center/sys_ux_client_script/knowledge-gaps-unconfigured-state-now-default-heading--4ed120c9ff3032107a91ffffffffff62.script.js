/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const noPermissionLabel = {
        "label": helpers.translateSync("You don’t have permission to access this data")
    };

    const activateFeatureLabel = {
        "label": helpers.translateSync("Activate knowledge gaps feature")
    };

    const noAccessToAllTaskTypes = (api.state.gapTaskTypeData || []).every(item => !item.canRead);
    if (noAccessToAllTaskTypes) {
        return noPermissionLabel;
    }

    const roles = api.context.session.user.roles || [];
    const hasAdminRole = roles.includes('sn_nowassist_admin.nsa_admin');

    if (hasAdminRole) {
        return activateFeatureLabel;
    }

    return noPermissionLabel;
}
