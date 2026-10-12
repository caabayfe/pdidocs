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
        idleTimeConfiguration: {
            fields,
            status,
            isIdleTimeConfigValid,
            message
        },
        processId,
        selectedEntity,
        metricsMessages,
        projectPermissions: {
            promin_process_def,
            promin_activity_def
        },
        projectIdleTimeEnabled
    } = api.state;

    const table = selectedEntity.table?.displayValue || '';

    if (!table) {
        return '';
    }

    if (!promin_process_def.canCreate) {
        let missingMessage = status ? metricsMessages.outOfSync.idletime :
                (!processId ? metricsMessages.configMissing?.message :
                (!isIdleTimeConfigValid ? message || metricsMessages.metricsMissing?.message : ''));

        if (status && promin_activity_def.canCreate) {
            return missingMessage;
        }

        return missingMessage += ` ${metricsMessages.contactAdmin}`;
    }

    if (status) {
        return metricsMessages.outOfSync.idletime;
    }

    if (!processId) {
        return metricsMessages.configMissing?.message;
    }

    if (!isIdleTimeConfigValid) {
      return message || metricsMessages.metricsMissing?.message;
    }

    return '';
}
