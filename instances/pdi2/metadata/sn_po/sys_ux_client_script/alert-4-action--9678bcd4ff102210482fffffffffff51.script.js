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
        metricsMessages,
        projectIdleTimeEnabled,
        projectTouchPointsEnabled,
        idleTimeConfiguration,
        touchPoints,
        projectPermissions: {
            promin_process_def
        }
    } = api.state;

    if (!promin_process_def?.canCreate) {
        return {};
    }
    
    if (!processId) {
        return {
            "href": "\"\"",
            "label": metricsMessages.configMissing?.action,
            "type": "acknowledge",
            "operation": "create_process_config"
        };
    }

    if (!projectIdleTimeEnabled && !projectTouchPointsEnabled &&
        !idleTimeConfiguration.isIdleTimeConfigValid &&
        touchPoints && !touchPoints.fields.length > 0) {
        return {
            "href": "\"\"",
            "label": metricsMessages.metricsMissing.action,
            "type": "acknowledge",
            "operation": "create_config_metrics"
        };
    }
}
