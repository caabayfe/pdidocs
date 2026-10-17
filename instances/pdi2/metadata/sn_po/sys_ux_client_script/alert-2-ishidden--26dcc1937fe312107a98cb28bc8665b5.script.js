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
        touchPoints,
        processId,
        touchPointsStatus,
        projectTouchPointsEnabled,
        projectIdleTimeEnabled,
        idleTimeConfiguration,
        processConfigLoading,
        loadingTouchpointStatus,
        savingTouchpoint,
    } = api.state;

    // Hide when process config is loading
    if (processConfigLoading) {
        return true;
    }

    // hide when process config is missing
    if (!processId && !projectTouchPointsEnabled) {
        return true;
    }

    // hide when both the touch points and idle time metrics are missing
    if (!projectIdleTimeEnabled && !projectTouchPointsEnabled &&
        !idleTimeConfiguration.isIdleTimeConfigValid &&
        touchPoints && !touchPoints.fields.length > 0) {
        return true;
    }

    if (savingTouchpoint) {
        return true;
    }

    if (loadingTouchpointStatus) {
        return true;
    }

    if (!touchPoints.fields.length > 0) {
        return false;
    }

    if (projectTouchPointsEnabled && touchPointsStatus.status) {
        return false;
    }

    return true;
}
