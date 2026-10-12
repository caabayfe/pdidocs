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
    const editedIndex = getTagsOriginalIndex(manageTags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex, event.context.item.index);
    let action = event.elementId === "tags_row_delete_button" ? "delete" : "add";
    if (action === "delete") {
        manageTags[editedIndex].deleted = true;
    }
    else {
        if (manageTags[editedIndex].key.value && manageTags[editedIndex].key.value) {
            manageTags[editedIndex].added = true;
            manageTags[editedIndex].sys_id.value = "added";
            manageTags.unshift({
                "key": {
                    "value": "",
                    "displayValue": ""
                },
                "value": {
                    "value": "",
                    "displayValue": ""
                },
                "sys_id": {
                    "value": "",
                    "displayValue": ""
                },
                "modified": false,
                "deleted": false
            });
        }
    }

    helpers.timing.setTimeout(() => {
        api.setState("manageTags", manageTags);
        api.setState('manageTagsPageData', getTagsPageSlice(manageTags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex));
    }, 10);
}
