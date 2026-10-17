/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const parentEntity = api.state.allEntities.find(entity => entity.parent_entity.value == null);
    // don't allow to add more child tables for play book projects
    if (api.state.isPlaybookSourceTypeProject) {
        return true;
    }

    const {
        promin_project,
        promin_project_entity
    } = api.state.projectPermissions;

    return !promin_project.canWrite || !promin_project_entity.canCreate || parentEntity?.source_type?.value == api.state.SOURCE_TYPES.AGENTIC_AI_DATA;
}
