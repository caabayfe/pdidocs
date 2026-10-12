/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("page", 0);
    api.setState("searchText","");
    var origData = api.state.origRowData;

    api.setState("rowData", origData);
}
