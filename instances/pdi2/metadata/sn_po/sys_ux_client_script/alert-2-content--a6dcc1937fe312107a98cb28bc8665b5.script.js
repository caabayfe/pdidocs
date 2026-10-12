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
        selectedEntity,
        metricsMessages,
        projectPermissions: {
            promin_process_def,
            promin_activity_def
        },
        touchPointsStatus,
        projectTouchPointsEnabled
    } = api.state;
    const table = selectedEntity.table?.displayValue || '';
    if (!table) {
        return '';
    }

    if (!promin_process_def?.canCreate) {
        let missingMessage = '';
        if (touchPointsStatus.status) {
            missingMessage = metricsMessages.outOfSync.touchpoints;
        } else if (!processId) {
            missingMessage = metricsMessages.configMissing?.message;
        } else if (!touchPoints.fields?.length > 0){
            missingMessage = metricsMessages.metricsMissing?.message;
        }
        if (!promin_activity_def?.canCreate) {
            missingMessage = `${missingMessage} ${metricsMessages.contactAdmin}`;
        }
        return missingMessage;
    }

    if (projectTouchPointsEnabled && touchPointsStatus.status) {
        return metricsMessages.outOfSync.touchpoints;
    }

    if (!processId) {
        return '';
    }

    if (!touchPoints.fields?.length > 0) {
        return metricsMessages.metricsMissing?.message;
    }

    return '';
}
