var PluginPreInstallService = Class.create();
PluginPreInstallService.prototype = {
    initialize: function() {
        this.tableName = sn_lef.GlideEntitlement.canRouteToEMS() ? "subscription_entitlement" : "license_details";
        this.licUrl = this.tableName + '_list.do?sysparm_query=status=0^ORstatus=2';
        this.pluginsData = new global.PluginsData();
    },
    getPreInstallPluginInfo: function(pluginInfo) {
        var preInstallPluginInfo = {};
        preInstallPluginInfo.licenseInfoURL = this.licUrl;
        var plugin = new GlideRecord("v_plugin");
        plugin.addEncodedQuery("id="+pluginInfo.id+"^ORsys_id="+pluginInfo.id);
        plugin.query();
        var pluginCount = plugin.getRowCount();
        if (pluginCount == 0) {
            plugin = new GlideRecord("v_plugin");
            plugin.addEncodedQuery("scopeLIKE" + pluginInfo.scope);
            plugin.query();
            pluginCount = plugin.getRowCount();
        }
        if (pluginCount > 1) {
            //try strategies to get down to 1 record
            var foundPlugin = false;
            var storeGR = new GlideRecord("sys_store_app");
            storeGR.get("scope", pluginInfo.scope);
            var sysCode = global.JSUtil.notNil(storeGR.getValue("sys_code")) ? storeGR.getValue("sys_code") : "";
            while (plugin.next()) {
                //Is exact scope or plugin id match?
                if (plugin.getValue('scope') == pluginInfo.scope || sysCode == plugin.getValue('id')) {
                    foundPlugin = true;
                    break;
                }
            }
            if (!foundPlugin) {
                preInstallPluginInfo.no_plugin_found = gs.getMessage("Plugin not found");
                return;
            }

        } else if (plugin.hasNext()) {
            plugin.next();
        }

        var custVer = "none";
        var sysId = null;
        if (plugin.scope != "global") {
            var scopeGr = new GlideRecord("sys_scope");
            scopeGr.addQuery("scope", plugin.scope);
            scopeGr.addQuery("scope", "!=", "global");
            scopeGr.query();
            if (scopeGr.next())
                sysId = scopeGr.sys_id;
            if (sysId != null) {
                var customGr = new GlideRecord("sys_app_customization");
                customGr.addQuery("vendor_app", sysId);
                customGr.query();
                if (customGr.next()) {
                    var version = customGr.getValue("version");
                    if (version != 'none')
                        custVer = version;
                }
            }
        }

        preInstallPluginInfo.customizedVersion = custVer;
        preInstallPluginInfo.help = plugin.getValue('help');
        preInstallPluginInfo.has_demo_data = plugin.has_demo_data == true;
        preInstallPluginInfo.block_install = plugin.block_install;
        preInstallPluginInfo.state = plugin.state;

        var pluginDependencies = {};
        pluginDependencies.WillBeActivated = [];
        pluginDependencies.installed = [];
        var dependency = new GlideRecord("v_plugin");
        dependency.addQuery("id", "IN", plugin.requires);
        dependency.query();
        while (dependency.next()) {
            var pluginDependency = {};
            pluginDependency.Id = dependency.getValue("name");
            pluginDependency.sys_id = dependency.getValue("sys_id");
            pluginDependency.plugin_id = dependency.getValue("id");
            pluginDependency.status = gs.getMessage('will be activated');
            pluginDependencies.status_value = "will_be_activated";
            if (dependency.active == 'active') {
                pluginDependency.status = gs.getMessage('Installed');
                pluginDependencies.status_value = "installed";
                pluginDependencies.installed.push(pluginDependency);
            } else {
                pluginDependencies.WillBeActivated.push(pluginDependency);
            }
        }
        preInstallPluginInfo.dependencies = pluginDependencies;

        try {
            preInstallPluginInfo.conditionalInActivePlugins = this.pluginsData.getUninstalledConditionalPlugins(pluginInfo.id);
            preInstallPluginInfo.enableInstallation = this.enableInstallation(plugin);
        } catch (err) {

        }
        preInstallPluginInfo.checkLicenseForPlugin = this.checkLicenseForPlugin(plugin.id);
        preInstallPluginInfo.hasLicenseForPlugin = this.hasLicenseForPlugin(plugin.id);
        preInstallPluginInfo.pluginActivationMode = this.getPluginActivationMode();
        preInstallPluginInfo.showUninstallationBlockedWarning = this.showUninstallationBlockedWarning(plugin);
        return preInstallPluginInfo;
    },

    showUninstallationBlockedWarning: function(plugin) {
        return plugin.active == 'inactive' && !sn_app_api.AppStoreAPI.canUninstall(plugin.scope, plugin.id);
    },

    checkLicenseForPlugin: function(pluginId) {
        var checkLic = sn_lef.GlideEntitlement.isLicenseCheckRequired(pluginId);
        return checkLic;
    },

    hasLicenseForPlugin: function(pluginId) {
        return sn_lef.GlideEntitlement.checkLicenseForPlugin(pluginId, false);
    },

    hasLicenseForApp: function(pluginID) {
        var hasLic = sn_lef.GlideEntitlement.hasLicenseForApp(pluginID);
        return hasLic;
    },

    getPluginActivationMode: function() {
        var activationMode = sn_lef.GlideEntitlement.getPluginActivationMode();
        return activationMode;
    },

    enableInstallation: function(plugin) {
        return !plugin.block_install && (plugin.active == 'active' || (plugin.definition.includes('no_activate') ? new global.PluginsData().checkNoActivateTagInPluginDefn(plugin) : true));
    },

    isInstallationAllowed: function() {
        return this.pluginsData.checkPluginInstallationAllowed();
    },

    type: 'PluginPreInstallService'
};
