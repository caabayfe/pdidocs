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
        metricsMessages,
        projectPermissions: {
            promin_process_def,
            promin_activity_def
        },
        touchPointsStatus,
        projectTouchPointsEnabled
    } = api.state;

    if (!promin_process_def?.canCreate) {
        if (!processId || !touchPoints.fields?.length > 0) {
            return {};
        }
        if (promin_activity_def?.canCreate && touchPointsStatus.status) {
            return {
                "href": "",
                "label": metricsMessages.outOfSync?.action,
                "type": "acknowledge",
                "operation": "review_process_configuration"
            };
        }
        return {};
    }

    if (touchPointsStatus.status && !processId) {
        return {};
    }

    if (projectTouchPointsEnabled && touchPointsStatus.status) {
        return {
            "href": "",
            "label": metricsMessages.outOfSync?.action,
            "type": "acknowledge",
            "operation": "review_process_configuration"
        };
    }

    if (!processId) {
        return {
            "href": "\"\"",
            "label": metricsMessages.configMissing?.action,
            "type": "acknowledge",
            "operation": "create_process_config"
        };
    }

    if (!touchPoints.fields?.length > 0) {
        return {
            "href": "\"\"",
            "label": metricsMessages.metricsMissing?.action,
            "type": "acknowledge",
            "operation": "create_config_metrics"
        };
    }
}
