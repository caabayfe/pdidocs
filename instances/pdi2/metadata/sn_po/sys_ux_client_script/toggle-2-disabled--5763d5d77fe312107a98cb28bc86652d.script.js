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
        touchPoints,
        touchPointsStatus,
        projectTouchPointsEnabled,
        projectPermissions: {
            promin_activity_def,
            promin_project,
        },
    } = api.state;

    if (!promin_activity_def.canCreate || !promin_project.canWrite) {
        return true;
    }
    if (touchPointsStatus.status || projectTouchPointsEnabled) {
        return false;
    }
    if (!processId || !touchPoints.fields?.length > 0) {
        return true;
    }
    return false;
}
