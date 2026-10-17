/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var roles = api.context.session.user.roles;
    const hasAdminRole = roles.includes('sn_nowassist_admin.nsa_admin');

    const noAccessToAllTaskTypes = (api.state.gapTaskTypeData || []).every(item => !item.canRead);
    if (noAccessToAllTaskTypes) {
        return [];
    }

    if (hasAdminRole) {
        return [{
            "label": helpers.translateSync("Activate feature"),
            "variant": "primary"
        }];
    }

    return [];
}
