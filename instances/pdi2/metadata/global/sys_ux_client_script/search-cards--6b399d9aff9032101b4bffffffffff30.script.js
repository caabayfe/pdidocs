/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let searchInfo = JSON.parse(JSON.stringify(api.state.searchInfo));
    searchInfo.offset = 0;
    if (event.payload.fieldValue)
        searchInfo.searchValue = event.payload.fieldValue;
    else if (!event.payload.fieldValue && api.state.searchTerm)
        searchInfo.searchValue = api.state.searchTerm;
    else
        searchInfo.searchValue = "";
    api.setState("searchInfo", searchInfo);
}
