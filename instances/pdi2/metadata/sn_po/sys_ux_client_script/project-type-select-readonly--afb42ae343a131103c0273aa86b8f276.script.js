/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let hideTemplate = true;
    const userPermissions = api.state.projectPermissions.promin_project.fields.is_template;
    // new project and user is admin
    if (api.context.props.projectId === '-1' && api.state.userInfo.isSnPoPowerUser) {
        hideTemplate = false;
    }

    return api.context.props.projectId !== '-1' || hideTemplate;
}
