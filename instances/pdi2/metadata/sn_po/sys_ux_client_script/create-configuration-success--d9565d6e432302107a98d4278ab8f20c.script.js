/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState('creatingNewConfigurationInprogress', false);
    const response = event.payload?.data?.output?.data?.snPo?.GlideProminProcessConfigurations?.createProminProcessConfiguration;
    if (response?.success) {
        const { label } = api.state.selectedProcessTable?.item || '';
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'configuration-saved-success',
                status: 'positive',
                icon: 'circle-check-outline',
                content: await helpers.translate(`Process configuration for {0} table was saved`, label),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        api.data.gliderecord_collection_query_1.refresh();
        helpers.modal.close("[component-id$='new-configuration-modal']");

        if (response.configId) {
            helpers.navigate.to('process-configuration-details', {
                processId: response.configId,
                step: 'process-details'
            }, null, true);
        }
        
        return;
    }
    const message = await helpers.translate(response.message);
    api.setState('errorMessage', message);
    api.setState('inputInvalid', true);
}
