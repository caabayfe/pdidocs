/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.delete_configurations.execute({
        processIds: api.state.selectedConfigListItems.map(row => row.id),
        isContentPack: false,
    });
}
