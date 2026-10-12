/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.dispTest)
        return true; // Hide.
    if (api.context.session.user.roles.indexOf('maint') == -1)
        return true; // Hide.
    return false;
}
