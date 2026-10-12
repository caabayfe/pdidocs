/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getTagsPageSlice,
        getTagsOriginalIndex
    } = imports["sn_cmdb_ws.ExploreCIMainContentUtils"](...arguments);
    
    const {
        manageTagsSelectedPageIndex,
        manageTagsSelectedPageSize
    } = api.state;
    
    let manageTags = [...api.state.manageTags];
    let editedIndex = getTagsOriginalIndex(manageTags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex, event.context.item.index);
    let name = event.payload.name;
    let value = event.payload.value;
    manageTags[editedIndex][name].value = value;
    manageTags[editedIndex].modified = true;
    // If it is the first one and they modified the key, classify it as added
    if (editedIndex === 0 && name === "key" && manageTags[editedIndex].sys_id.value === "") {
        manageTags[editedIndex].sys_id.value = "added";
        manageTags[editedIndex].added = true;
    }
    api.setState("manageTags", manageTags);
    api.setState("manageTagsPageData", getTagsPageSlice(manageTags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex));
}
