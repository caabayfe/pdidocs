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
        touchPoints,
        projectTouchPointsEnabled,
        projectIdleTimeEnabled,
        metricsMessages,
        projectPermissions: {
            promin_process_def
        }
    } = api.state;

    let message = '';

    if (!promin_process_def?.canCreate) {
        message = metricsMessages.contactAdmin;
    }

    if (!processId) {
        return `${metricsMessages.configMissing?.message} ${message}`;
    }

    if (!projectIdleTimeEnabled && !projectTouchPointsEnabled &&
        !idleTimeConfiguration.isIdleTimeConfigValid &&
        touchPoints && !touchPoints.fields.length > 0) {
        return `${metricsMessages.metricsMissing?.message} ${message}`;
    }

    return '';
}
