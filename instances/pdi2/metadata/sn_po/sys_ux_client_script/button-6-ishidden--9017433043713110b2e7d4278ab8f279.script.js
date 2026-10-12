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
    const currentTable = api.state.listTable;
    if (currentTable === 'promin_finding_def') {
        return api.state.ruleBasedFindingsCount === 0 || !api.state.projectPermissions.promin_finding_def.canDelete;
    } else if (currentTable === 'promin_automated_finding') {
        return api.state.automatedFindingsCount === 0 || !api.state.projectPermissions.promin_finding_def.canDelete;
    }
}
