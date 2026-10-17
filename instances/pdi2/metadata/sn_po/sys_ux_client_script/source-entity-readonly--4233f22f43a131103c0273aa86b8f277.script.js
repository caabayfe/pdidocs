/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        projectPermissions,
        resetPrimaryEntity,
        sourceType,
    } = api.state;
    // User cannot change source table for AGENTIC_AI_DATA
    if(sourceType === 'AGENTIC_AI_DATA') {
        return true;
    }
    let hasAccess = true;
    if (api.context.props.projectId !== '-1') {
        hasAccess = projectPermissions.promin_project_entity.canCreate;
        if (hasAccess && resetPrimaryEntity) {
            return false;
        }
    }

    return (api.state.isEditing || !hasAccess);
}
