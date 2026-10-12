/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
     var tempQuickLinks = JSON.parse(JSON.stringify(api.state.quickLinksTruncated));
    if (api.state.quickLinksMoreItemAvailable == 'yes') {
        api.setState('quickLinks', tempQuickLinks);
        api.setState('quickLinksMoreItemAvailable', 'no');
        var text = await helpers.translate('View fewer');
        api.setState('quickLinksViewMoreFewerText', text);
    } else {
        api.setState('quickLinks', tempQuickLinks.splice(0, api.state.quickLinkMaxLength));
        api.setState('quickLinksMoreItemAvailable', 'yes');
        var text = await helpers.translate('View {0} more', (api.state.quickLinksTruncated.length - api.state.quickLinkMaxLength));
        api.setState('quickLinksViewMoreFewerText', text);
    }
}
