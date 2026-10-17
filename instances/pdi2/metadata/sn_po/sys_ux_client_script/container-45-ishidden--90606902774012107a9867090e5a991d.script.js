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
        processConfigurationsList,
        processConfigurationsLoading
    } = api.state;
    if (processConfigurationsList.rows) {
        return processConfigurationsList.rows.length == 0;
    }
    return processConfigurationsLoading;
}
