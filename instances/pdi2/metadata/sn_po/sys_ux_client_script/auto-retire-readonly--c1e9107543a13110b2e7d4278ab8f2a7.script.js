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
        projectPermissions: pp,
        autoRetire: ar
    } = api.state;

    let canWriteProject = false;
    const projectId = api.context.props.projectId;
    if (!projectId || projectId === '-1') {
        canWriteProject = true;
    } else {
        canWriteProject = pp.promin_project.canWrite;
    }

    return ar.readOnly || !(pp.promin_project.fields.auto_retire.canWrite) || !canWriteProject;
}
