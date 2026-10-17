/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const newProcessConfigId = event.payload.data.output.data.GlidePromin_Mutation.copyProcessConfig;
    if (newProcessConfigId) {
        helpers.navigate.to('process-configuration-details', {
            processId: newProcessConfigId,
            step: 'impact-metrics'
        }, null, true);
    }
}
