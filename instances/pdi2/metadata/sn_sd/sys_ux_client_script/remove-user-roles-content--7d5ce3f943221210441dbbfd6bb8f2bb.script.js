/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return helpers.translateSync("Are you sure you want to remove selected users from role: {0}", api.state.selectedRoleLabel);
}
