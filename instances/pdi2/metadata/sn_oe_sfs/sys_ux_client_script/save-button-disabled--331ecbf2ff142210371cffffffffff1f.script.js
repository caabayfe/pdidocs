/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (((!api.state.isFeatureEnabled || api.state.isSLABreach) || api.state.isSLABreachColor)) {
        return true;
    }
    let workspaceExists = false;
    for (let i = 0; i < api.state.configuredWorkspace.items.length; i++) {
        if (api.state.configuredWorkspace.items[i].workspace_name === api.state.workSpaceId) {
            workspaceExists = true;
            break;
        }
    }
    if (api.state.isSessionTabEnabled === false && workspaceExists === false) {
        return true;
    }
    return false;
}
