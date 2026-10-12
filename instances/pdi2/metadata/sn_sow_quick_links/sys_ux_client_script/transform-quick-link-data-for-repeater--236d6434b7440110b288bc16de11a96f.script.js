/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var quickLinks = api.data.get_quick_links.output.data.GlideRecord_Query.quick_links._results;
    var transformedQuickLinks = [];
    for (var index = 0; index < quickLinks.length; index++) {
        var link = {};
        link['url'] = decodeURIComponent(quickLinks[index].url.value);
        link['title'] = decodeURIComponent(quickLinks[index].title.value);
        link['order'] = quickLinks[index].order.value;
        link['sys_id'] = quickLinks[index].sys_id.value;
        link['editContainerHidden'] = true;
        link['invalidURLMessage'] = '[]';
        transformedQuickLinks.push(link);
    }
    api.setState('truncatedQuickLink', transformedQuickLinks);
    var tempQuickLinks = JSON.parse(JSON.stringify(transformedQuickLinks));
    if (api.state.moreItemAvailable == 'no') {
        api.setState('quickLinks', tempQuickLinks);
        api.setState('moreItemAvailable', 'no');
        var text = await helpers.translate('View fewer');
        api.setState('viewMoreFewerText', text);
    } else {
        api.setState('quickLinks', tempQuickLinks.splice(0, 5));
        if (transformedQuickLinks.length > 5) {
            api.setState('moreItemAvailable', 'yes');
            var text = await helpers.translate('View {0} more', (transformedQuickLinks.length - 5));
            api.setState('viewMoreFewerText', text);
        }
    }
}
