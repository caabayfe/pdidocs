function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Constant array with list of domain plugins required
    var domainPluginIds = ['domain_support', 'domain_extension', 'domain_filter'];
    // Default the domain filter is hidden, unless above plugins are installed.
    var hideDomain = true;
    if (api.data.domain_plugins_check.output.items.length > 0 && api.data.domain_plugins_check.output.items.length >= 3) {
        var pluginItems = api.data.domain_plugins_check.output.items;
        var pluginIds = [];
        for (var i in pluginItems) {
            pluginIds.push(pluginItems[i].id);
        }
        for (var id in domainPluginIds) {
            if (pluginIds.indexOf(domainPluginIds[id]) === -1) {
                hideDomain = true;
                break;
            } else {
                hideDomain = false;
            }
        }
        api.setState('hideDomainContainer', hideDomain);
    }

}
