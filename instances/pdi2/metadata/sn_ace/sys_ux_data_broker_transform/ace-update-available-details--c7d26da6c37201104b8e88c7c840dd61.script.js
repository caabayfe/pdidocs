function transform(input) {
	
	var result = {};
	if (!input.payload) {
        return result;
    }
	
    function getPluginOrAppDetails(id, type, pluginName) {
        var details = {
            name: pluginName || id,
            currentVersion: '',
            newerVersion: '',
            pluginId: id,
            hasDemoData: false
        };
        if (type === 'application') {
            var gr_store_app = new GlideRecord('sys_store_app');
            gr_store_app.addQuery('sys_id', id);
            gr_store_app.query();
            if (gr_store_app.next()) {
                details.currentVersion = gr_store_app.getValue('version');
                details.newerVersion = gr_store_app.getValue('latest_version');
                details.name = gr_store_app.getValue('name');
                details.pluginId = gr_store_app.getValue('scope');
                details.hasDemoData = gr_store_app.getValue('demo_data') == 'has_demo_data' ? true : false;
            }
        }
        return details;
    }
    
    try {
        var pluginDetails = JSON.parse(input.payload.plugins);
        var plugins = Object.keys(pluginDetails).map(function(plugin) {
            var details = getPluginOrAppDetails(plugin, pluginDetails[plugin], input.payload.pluginName);
            var isInstalled = GlidePluginManager.isActive(details.pluginId);
            return {
                id: plugin,
                type: pluginDetails[plugin],
                installed: isInstalled,
                name: details.name,
                version: details.version,
                currentVersion: details.currentVersion,
                newerVersion: details.newerVersion,
                pluginId: details.pluginId,
                hasDemoData: details.hasDemoData
            };
        });

        result.plugins = plugins;

        result.isUpdateAvailable = plugins.some(function(plugin) {
            return plugin.installed && plugin.newerVersion && plugin.newerVersion != plugin.currentVersion;
        });

        if (input.payload.action == 'update' && result.isUpdateAvailable) {
            result.status = 'ready to update';
        }

    } catch (e) {
        gs.error('Unable to parse plugin(s) information' + e);
    }
    return result;

}
