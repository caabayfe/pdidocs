/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !api.state.projectPermissions.promin_breakdown_field.canWrite || !api.state.projectPermissions.promin_project.canWrite;
}
