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
        idleTimeConfiguration,
        processId,
        metricsMessages,
        projectPermissions: {
            promin_process_def
        }
    } = api.state;

    if (!promin_process_def?.canCreate && (!processId || !idleTimeConfiguration.fields?.length > 0)) {
        return metricsMessages.contactAdmin;
    }

}
