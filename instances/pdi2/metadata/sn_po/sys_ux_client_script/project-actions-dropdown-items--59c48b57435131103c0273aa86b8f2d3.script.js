/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let listItems = api.state.projectActionsListItems;
    const permissions = api.state.projectPermissions;

    const projectResult = api.data.get_current_project.result;
    if (!projectResult || !projectResult.is_template) {
        return listItems;
    }

    if (projectResult.is_template.value) {
        return listItems.filter(item => item.id === 'delete_project');
    }

    if (api.state.isSharedProject || !permissions.promin_project.canDelete) {
        return listItems.filter(item => item.id !== 'delete_project');
    }

    if (api.state.projectData.ismining) {
        return listItems.filter(item => item.id !== 'manage_watchlist' && item.id!='extract_data_logs');
    }

    return listItems;
}
