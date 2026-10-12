/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const userRoles = api.context.session.user.roles;
    return !userRoles || !userRoles.includes('admin');
}
