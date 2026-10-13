/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const searchText = event.payload.value;
    if (searchText == ""){
        return;
    }
    api.setState('searchText', searchText);
}
