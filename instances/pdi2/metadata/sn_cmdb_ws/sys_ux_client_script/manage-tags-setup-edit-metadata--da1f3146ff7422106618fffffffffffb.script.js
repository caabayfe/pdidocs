/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        getTagsPageSlice
    } = imports["sn_cmdb_ws.ExploreCIMainContentUtils"](...arguments);
    
    // Default with an empty tag
    let tags = [{
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
    }];
    let currentTags = api.data.get_tags_for_ci.results;
    const {
        manageTagsSelectedPageIndex,
        manageTagsSelectedPageSize
    } = api.state;
    
    for (let i = 0; i < currentTags.length; i++) {
        let currentTag = currentTags[i];
        tags.push({
            ...currentTag,
            "modified": false,
            "deleted": false
        });
    }
    api.setState("manageTags", tags);
    api.setState("manageTagsPageData", getTagsPageSlice(tags, manageTagsSelectedPageSize, manageTagsSelectedPageIndex));
    helpers.modal.open('manage_tags_modal', {
        headerLabel: await helpers.translate('Manage tags')
    });
}
