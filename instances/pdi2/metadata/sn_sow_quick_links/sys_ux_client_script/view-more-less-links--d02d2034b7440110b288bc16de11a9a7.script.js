/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    // take lastest data on view more/less
    var tempQuickLinks = JSON.parse(JSON.stringify(api.state.truncatedQuickLink));

    if (api.state.moreItemAvailable == 'yes') {
        api.setState('quickLinks', tempQuickLinks);
        api.setState('moreItemAvailable', 'no');
        var text = await helpers.translate('View fewer');
        api.setState('viewMoreFewerText', text);
    } else {
        api.setState('quickLinks', tempQuickLinks.splice(0, 5));
        api.setState('moreItemAvailable', 'yes');
        var text = await helpers.translate('View {0} more', (api.state.truncatedQuickLink.length - 5));
        api.setState('viewMoreFewerText', text);
    }
}
