/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.selectedEntity || !api.state.selectedEntity.table) {
        return true;
    }

    // Hide Approval analysis action if current entity is approval table
    return api.state.selectedEntity.table.value === 'sysapproval_approver';
}
