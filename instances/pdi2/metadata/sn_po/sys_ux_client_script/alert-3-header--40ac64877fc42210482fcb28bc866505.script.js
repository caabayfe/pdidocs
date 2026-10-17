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
        idleTimeConfiguration,
        projectIdleTimeEnabled,
        projectPermissions: {
            promin_process_def
        }
    } = api.state;
    if (idleTimeConfiguration.isIdleTimeConfigValid) {
        return '';
    }
    if (!processId && !projectIdleTimeEnabled) {
        return metricsMessages.configMissing?.header || '';
    }
    return '';
}
