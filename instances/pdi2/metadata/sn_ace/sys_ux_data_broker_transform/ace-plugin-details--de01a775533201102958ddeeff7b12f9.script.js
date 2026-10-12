function transform(input) {
    var result = {};

    if (!input.payload) {
        return result;
    }


    function getPluginOrAppDetails(id, type, pluginName, pluginDetail, mode) {
        var details = {
            name: pluginName || id,
            currentVersion: '',
            newerVersion: '',
            pluginId: id,
            hasDemoData: false
        };
        if (type === 'application') {
            switch (mode) {
                case 'install': {
                    var grApp = new GlideRecord('sys_app_version');
                    grApp.addQuery('source_app_id', id);
                    grApp.query();
                    while (grApp.next()) {
                        var version = grApp.getValue('version');
                        if (!(details.currentVersion) || (new sn_appclient.VersionComparator().isUpgrade(
                                details.currentVersion,
                                version
                            ))) {
                            // for applications use app scope as pluginId
                            details.pluginId = grApp.getValue('scope');
                            details.name = grApp.getValue('name');
                            details.currentVersion = version;
                            details.hasDemoData = grApp.getValue('demo_data') == 'has_demo_data' ? true : false;
                        }
                    }
                    break;
                }
                case 'update': {
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
                    break;
                }
            }

        } else if (type == "plugin" && pluginDetail) {
            details.currentVersion = pluginDetail.version;
            details.name = pluginDetail.name || id;
            details.hasDemoData = pluginDetail.hasDemoData;
        }
        return details;
    }

    try {

        var payload = input.payload || {};
        var pluginInfo = payload.plugins;
        var pluginDetails = payload.pluginDetails || {};

        var plugins = Object.keys(pluginInfo).map(function(plugin) {
            var details = getPluginOrAppDetails(plugin, pluginInfo[plugin], payload.pluginName, pluginDetails[plugin], payload.action);
            var isInstalled = GlidePluginManager.isActive(details.pluginId);
            return {
                id: plugin,
                type: pluginInfo[plugin],
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

        var progressId = payload.progress_id;
        if (progressId) {
            result.status = 'installing';
        } else {
            result.status = plugins.some(function(p) {
                return !p.installed;
            }) ? 'ready to install' : 'installed';
        }

        result.isUpdateAvailable = plugins.some(function(plugin) {
            return result.status == 'installed' && plugin.newerVersion && plugin.newerVersion != plugin.currentVersion;
        });

        if (payload.action == 'update' && result.isUpdateAvailable) {
            result.status = 'ready to update';
        }

    } catch (e) {
        gs.error('Unable to parse plugin(s) information' + e);
    }
    return result;

}
