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
        touchPoints,
        touchPointsStatus,
        projectPermissions: {
            promin_process_def
        }
    } = api.state;
    if (touchPointsStatus.fields && touchPointsStatus.fields.length > 0) {
        return '';
    }
    if (!processId && Object.keys(metricsMessages).length > 0) {
        return '';
    }
    return '';
}
