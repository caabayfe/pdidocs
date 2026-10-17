/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let items = api.state.projectTypes;
    let hideTemplate = true;
    const userPermissions = api.state.projectPermissions.promin_project.fields.is_template;
    // new project and user is admin
    if (api.context.props.projectId === '-1' && api.state.userInfo.isSnPoPowerUser) {
        hideTemplate = false;
    }
    // edit mode
    else if (api.context.props.projectId !== '-1') {
        if (api.state.projectTemplateDetails.isTemplate) {
            hideTemplate = false;
        }
    }

    if (hideTemplate) {
        items = items.filter(item => item.id !== 'TEMPLATE');
    }

    return items;
}
