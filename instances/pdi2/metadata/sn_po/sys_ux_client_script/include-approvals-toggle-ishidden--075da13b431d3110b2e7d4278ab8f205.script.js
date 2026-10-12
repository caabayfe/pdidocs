/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.projectId !== '-1') {
        return !api.state.projectPermissions.promin_project_entity.fields.include_approvals.canWrite;
    }
    return false;
}
