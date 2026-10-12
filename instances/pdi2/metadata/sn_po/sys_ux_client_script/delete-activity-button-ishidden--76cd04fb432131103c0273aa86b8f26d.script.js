/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.projectPermissions.promin_activity_def.canDelete || !api.state.projectPermissions.promin_project.canWrite) {
        return true;
    }

    const currentView = { ...api.state.currentView
    };

    if (currentView.params.mode === 'EDIT') {
        return false;
    }

    return true;
}
