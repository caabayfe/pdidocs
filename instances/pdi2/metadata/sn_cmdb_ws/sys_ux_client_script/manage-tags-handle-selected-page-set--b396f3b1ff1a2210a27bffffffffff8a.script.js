/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getTagsPageSlice
    } = imports["sn_cmdb_ws.ExploreCIMainContentUtils"](...arguments);
    const {
        manageTags,
        manageTagsSelectedPageSize
    } = api.state;
    const manageTagsSelectedPageIndex = event.payload.value;
    api.setState('manageTagsSelectedPageIndex', manageTagsSelectedPageIndex);
    api.setState('manageTagsPageData', getTagsPageSlice(manageTags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex));
}
