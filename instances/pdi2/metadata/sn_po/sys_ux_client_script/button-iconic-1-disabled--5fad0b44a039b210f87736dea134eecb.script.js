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
        promin_project,
    } = api.state.projectPermissions;
    let canWriteProject = false;

    const projectId = api.context.props.projectId;
    if (!projectId || projectId === '-1') {
        canWriteProject = true;
    } else {
        canWriteProject = promin_project.canWrite;
    }

    return !canWriteProject;
}
