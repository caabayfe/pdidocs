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
            promin_process_def
        }
    } = api.state;

    if (!promin_process_def?.canCreate && (!processId || !touchPoints.fields?.length > 0)) {
        return metricsMessages.contactAdmin;
    }
}
