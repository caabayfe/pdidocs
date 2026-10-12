/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.totalFindingsCount == 0 || !api.state.projectPermissions.promin_finding_def.canCreate || !api.state.projectPermissions.promin_project.canWrite;
}
