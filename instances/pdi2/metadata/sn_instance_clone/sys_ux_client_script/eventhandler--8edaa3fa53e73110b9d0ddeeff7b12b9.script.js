/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.name == "SN_LIST_SELECTOR#SELECTED_ITEM_SET")
        api.setState("selectedColumns",event.payload);
}
