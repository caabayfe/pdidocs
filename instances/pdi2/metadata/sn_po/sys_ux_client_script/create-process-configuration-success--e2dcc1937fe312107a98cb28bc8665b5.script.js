/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const response = event.payload.data.output.data.snPo.GlideProminProcessConfigurations?.createProminProcessConfiguration;
    if (response?.success && response.configId) {
        helpers.navigate.to('process-configuration-details', {
            processId: response.configId,
            step: 'impact-metrics'
        }, null, true);
    }
}
