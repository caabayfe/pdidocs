/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.projectId == -1) {
        return false;
    }
    return !(api.state.projectPermissions.isMaint || api.state.projectPermissions.isCreator);
}
