/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !(canUserViewUsageDetailLink(api) && api.state.dashboardLink !== null);
}

function canUserViewUsageDetailLink(api) {
    var authorizedRoles = ["usage_admin", "admin", "maint", "sn_sub_man.admin"];
    for (var i = 0; i < authorizedRoles.length; i++)
        if (api.context.session.user.roles.includes(authorizedRoles[i])) return true;
    return false;
}
