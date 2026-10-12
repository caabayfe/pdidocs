/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let searchInfo = JSON.parse(JSON.stringify(api.state.searchInfo));
    let pageNumber = 0;
    if (event.payload.value)
        pageNumber = event.payload.value;
    searchInfo.offset = pageNumber * parseInt(api.state.pageLimit);
    api.setState("searchInfo", searchInfo);
}
