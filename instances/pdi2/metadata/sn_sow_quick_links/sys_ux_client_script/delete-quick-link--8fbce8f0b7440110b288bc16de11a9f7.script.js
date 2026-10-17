/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemIndex = api.state.currentEditableItemIndex;
    var links = api.state.quickLinks;
    var sysId = links[itemIndex].sys_id;

    api.data.delete_quick_link_record.execute({
        'table': 'quick_links',
        'recordId': sysId
    });

    api.data.get_quick_links.refresh();
}
