/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('creatingNewConfigurationInprogress', false);
    helpers.modal.close("[component-id$='new-configuration-modal']");
    
    const newProcessConfigId = event.payload.data.output.data.GlidePromin_Mutation.copyProcessConfig;

    if (newProcessConfigId) {
        api.data.gliderecord_collection_query_1.refresh();

        helpers.navigate.to('process-configuration-details', {
            processId: newProcessConfigId,
            step: 'process-details'
        }, null, true);
    }
}
