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
    searchInfo.searchValue = "";
    searchInfo.selectedFilter = [["all"]];
    searchInfo.selectedFilterPref = "all";
    api.setState("searchInfo", searchInfo);
    api.setState("searchTerm", "");
    helpers.timing.setTimeout(() => api.emit("UPDATE_USER_FILTER_PREFERENCES", {}));
}
