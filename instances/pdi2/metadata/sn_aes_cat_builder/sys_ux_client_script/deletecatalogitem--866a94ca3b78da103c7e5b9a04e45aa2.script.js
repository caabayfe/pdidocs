/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        catalogItemToDelete,
        isNewRecord
    } = api.state;
    if(catalogItemToDelete) {
        helpers.snHttp('/api/sn_sc/v1/servicecatalog/item/' +
        catalogItemToDelete, {
            method: 'DELETE'
        }).then(resp => {
        api.emit("SN_AES_BUILDER#CLOSE_CURRENT_TAB",
        {"nextSelectedTabId": "home"});
        });
    }
}
