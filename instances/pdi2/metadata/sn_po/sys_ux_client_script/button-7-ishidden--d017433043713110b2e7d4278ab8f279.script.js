/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.projectPermissions.promin_project.canWrite) {
        return true;
    }
    if (api.state.listTable == 'promin_automated_finding') {
        return !api.state.projectPermissions.promin_automated_finding.canCreate;
    } else {
        return !api.state.projectPermissions.promin_finding_def.canCreate;
    }
}
