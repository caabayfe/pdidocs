/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { selectedEntity,isPlaybookSourceTypeProject } = api.state;
    // Hide entity condition builder if project is a template or PA project
    const projectDetails = {
        ...api.state.projectDetails
    };
    // hide for child entities for play book projects
    if (isPlaybookSourceTypeProject && selectedEntity.parent_entity?.value) {
        return true;
    }
    if (projectDetails.source && projectDetails.source?.value && projectDetails.source?.value.startsWith('FREEMIUM')) {
        return true;
    }
    if (api.state.projectPermissions.promin_project_entity.fields.filter.canWrite) {

        if (!projectDetails.is_template || !projectDetails.pa_uuid) {
            return false;
        }

        return Boolean(projectDetails.is_template.value || projectDetails.pa_uuid.value);
    }
    return true;
}
