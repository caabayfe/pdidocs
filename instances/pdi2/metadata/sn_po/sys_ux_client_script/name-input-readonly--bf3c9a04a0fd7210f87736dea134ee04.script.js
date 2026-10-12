/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const projectId = api.context.props.projectId;
    let canEdit = false;

    if (!projectId || projectId === '-1') {
        canEdit = true;
    } else {
        canEdit = api.state.projectPermissions.promin_project.canWrite;
    }

    return api.state.projectDetails.readonly || !canEdit;
}
