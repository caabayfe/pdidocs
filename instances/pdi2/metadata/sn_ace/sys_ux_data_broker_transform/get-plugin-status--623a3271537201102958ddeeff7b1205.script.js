function transform(input) {

    var result = {};

    if (!input.payload) {
        return result;
    }

    var pluginDetails = {};
    try {

        var payload = input.payload || {};
        var hasPluginDetailsData = payload.plugin_details && Object.keys(payload.plugin_details).length > 0;
        pluginDetails = hasPluginDetailsData ? payload.plugin_details : JSON.parse(input.payload.plugins);
        var plugins = Object.keys(pluginDetails).map(function(plugin) {
            return {
                id: plugin,
                installed: hasPluginDetailsData ? (pluginDetails[plugin]['app_scope'] ? GlidePluginManager.isActive(pluginDetails[plugin]['app_scope']) : GlidePluginManager.isActive(plugin)) : (input.payload.app_scope ? GlidePluginManager.isActive(input.payload.app_scope) : GlidePluginManager.isActive(plugin))
            };
        });

        var progressId = payload.progress_id;
        if (progressId) {
            result.status = 'installing';
        } else {
            result.status = plugins.some(function(p) {
                return !p.installed;
            }) ? 'ready to install' : 'installed';
        }
        return result;

    } catch (e) {
        gs.info('Unable to parse plugin(s) information' + e);
        return result;
    }

}
