/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (event.payload.parentTable && event.payload.parentSysId) {
        api.state.refreshImpactedServicesParams.parentTable = event.payload.parentTable;
        api.state.refreshImpactedServicesParams.parentSysId = event.payload.parentSysId;
        api.data.refresh_impacted_services.refresh();
    } else {
        const errorMessage = await helpers.translate('Failed to initiate Refresh impacted services');
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                type: 'error',
                message: errorMessage
            }]
        });
    }
}
