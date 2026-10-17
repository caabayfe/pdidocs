/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemIndex = api.state.quickLinksCurrentEditableItemIndex;
    var links = api.state.quickLinks;
    var url = api.state.quickLinksCurrentEditableItemURL;
    var displayText = api.state.quickLinksCurrentEditableItemDisplayText;
    var sysId = links[itemIndex].sys_id;

    const queryString = 'url=' + encodeURIComponent(url) + '^title=' + encodeURIComponent(displayText);
    api.data.update_cmdb_quick_link_record.execute({
        'table': 'sn_cmdb_ws_quick_links',
        'recordId': sysId,
        'templateFields': queryString,
        'useSetDisplayValue': false
    });

    api.setState("quickLinksEditMode", false);
    api.setState('quickLinksCurrentEditableItemIndex', -1);
    api.data.get_cmdb_quick_links.refresh();
}
