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
        isPlaybookSourceTypeProject
    } = api.state;
    const currentEntity = api.item.value;
    // hide the delete button for child entity if source type is playbook.
    if (isPlaybookSourceTypeProject && Boolean(currentEntity.parentId)) {
        return true;
    }
    return !api.state.projectPermissions.promin_project_entity.canDelete;
}
