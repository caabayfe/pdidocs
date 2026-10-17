/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const value = event?.payload?.fieldValue || "";
    
    if (api.state.searchText && api.state.searchText.length > 0 && !value) {
        api.setState("page", 0);
        api.setState("rowData", api.state.origRowData);
        api.setState("displayedSearchText", "");
    }
    api.setState("searchText", value);
}
