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
        processId,
        idleTimeConfiguration,
        projectIdleTimeEnabled,
        projectPermissions: {
            promin_activity_def,
            promin_project,
        }
    } = api.state;

    if (!promin_activity_def.canCreate || !promin_project.canWrite) {
        return true;
    }
    if (projectIdleTimeEnabled) {
        return false;
    }
    if (!processId || !idleTimeConfiguration.isIdleTimeConfigValid) {
        return true;
    }
    return false;
}
