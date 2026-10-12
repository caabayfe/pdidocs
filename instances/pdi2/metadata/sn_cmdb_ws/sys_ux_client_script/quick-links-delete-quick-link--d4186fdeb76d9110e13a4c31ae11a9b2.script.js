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
    var sysId = links[itemIndex].sys_id;

    api.data.delete_cmdb_quick_link_record.execute({
        'table': 'sn_cmdb_ws_quick_links',
        'recordId': sysId
    });
    api.setState("quickLinksEditMode", false);
}
