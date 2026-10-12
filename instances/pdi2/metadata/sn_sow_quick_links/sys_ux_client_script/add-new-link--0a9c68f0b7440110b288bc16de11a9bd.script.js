/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const url = api.state.newLinkURL;
    const displayText = api.state.newLinkDisplayText;
    const user = api.context.session.user.sys_id;
    const order = api.state.quickLinks.length > 0 ? api.state.truncatedQuickLink[api.state.truncatedQuickLink.length - 1]['order'] + 1 : 1;
    const queryString = 'user=' + user + '^url=' + encodeURIComponent(url) + '^title=' + encodeURIComponent(displayText) + '^order=' + order;
    api.data.create_quick_link_record.execute({
        'table': 'quick_links',
        'templateFields': queryString,
        'useSetDisplayValue': false
    });

// clear inputs
    api.setState('newLinkURL', '');
    api.setState('newLinkDisplayText', '');
    
// need to refresh getQuickLinks to get new record sys id to perform reorder or update
    api.data.get_quick_links.refresh();
}
