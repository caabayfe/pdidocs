function transform(input) {
    var result = {};
    if (!input.plugins) {
        return result;
    }

    var appInstallationPayload = {};
    input.plugins.forEach(function(p) {
        if (p.type == "plugin") {
            appInstallationPayload[p.id] = {
                plugin_id: p.id,
                app_name: p.name,
                isPlugin: true,
                loadDemoData: p.install_demo_data
            };
        } else if (p.type == "application") {
            appInstallationPayload[p.id] = {
                sys_id: p.id,
                app_name: p.name,
                versionObj: {
                    version: (p.newerVersion) ? p.newerVersion : p.currentVersion
                },
                appScope: p.pluginId,
                isStoreApp: true,
                loadDemoData: p.install_demo_data
            };
        }
    });
    try {
        var api = new sn_appclient.AppPluginInstallation();
        result = api.validateAndBatchInstall('ACE', appInstallationPayload);
    } catch (e) {
        gs.error("Failed to generate app installation payload" + e.toString());
    }
    return result;




}
