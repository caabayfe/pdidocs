/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const url = api.state.quickLinksNewUrlLink;
    const displayText = api.state.quickLinksNewDisplayText;
    const user = api.context.session.user.sys_id;
    const order = api.state.quickLinks.length > 0 ? api.state.quickLinksTruncated[api.state.quickLinksTruncated.length - 1]['order'] + 1 : 1;
    const queryString = 'user=' + user + '^url=' + encodeURIComponent(url) + '^title=' + encodeURIComponent(displayText) + '^order=' + order;
    api.data.create_cmdb_quick_link_record.execute({
        'table': 'sn_cmdb_ws_quick_links',
        'templateFields': queryString,
        'useSetDisplayValue': false
    });
    
// clear inputs
    api.setState('quickLinksNewUrlLink', '');
    api.setState('quickLinksNewDisplayText', '');

}
