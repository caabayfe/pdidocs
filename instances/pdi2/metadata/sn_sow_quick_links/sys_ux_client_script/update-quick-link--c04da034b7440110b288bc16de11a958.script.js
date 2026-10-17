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
    var url = api.state.currentEditableItemURL;
    var displayText = api.state.currentEditableItemDisplayText;
    var sysId = links[itemIndex].sys_id;

    const queryString = 'url=' + encodeURIComponent(url) + '^title=' + encodeURIComponent(displayText);
    api.data.update_quick_link_record.execute({
        'table': 'quick_links',
        'recordId': sysId,
        'templateFields': queryString,
        'useSetDisplayValue': false
    });

    api.setState('currentEditableItemIndex', -1);
    api.data.get_quick_links.refresh();
}
