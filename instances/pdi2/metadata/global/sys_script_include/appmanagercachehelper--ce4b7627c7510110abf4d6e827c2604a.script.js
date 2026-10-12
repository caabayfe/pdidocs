var AppManagerCacheHelper = Class.create();
AppManagerCacheHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    refreshAppManagerCache: function() {
        if (gs.getProperty("sn_appclient.enable_app_manager_cache", "true") !== "true")
            return;

        this.installationStartTime = !gs.nil(this.getParameter('sysparm_install_start_time')) ?
            new GlideDateTime(this.getParameter('sysparm_install_start_time')).getValue() : new GlideDateTime().getValue();
        this.installationEndTime = new GlideDateTime().getValue();


        this.specificAppsToUpdate = [];
        this.addLatestInstalledApps();
        this.specificAppsToUpdate = this.specificAppsToUpdate.concat(this.getLatestActivatedPlugins(this.getParameter('sysparm_active_plugins_before')));

        var args = {
            specificAppsToUpdate: this.specificAppsToUpdate,
            sharedInternally: false
        };

        var appManagerCache = new global.AppManagerCache();
        appManagerCache.removeAndAppendCorrectAppsInCache(args);
        appManagerCache.updateInstalledPluginsInCache(args);
		new sn_appclient.UpdateChecker().updateInstalledAppsInStoreAsync();
    },

    addLatestInstalledApps: function() {
        var storeAppGr = new GlideRecord("sys_store_app");
        storeAppGr.addQuery("sys_updated_on", ">=", this.installationStartTime);
        storeAppGr.addQuery("sys_updated_on", "<=", this.installationEndTime);
        storeAppGr.addActiveQuery();
        storeAppGr.query();

        while (storeAppGr.next()) {
            this.specificAppsToUpdate.push({
                sourceAppId: storeAppGr.sys_id.toString(),
                scope: storeAppGr.scope.toString(),
                sysCode: storeAppGr.sys_code.toString()
            });
        }
    },

    getActivePlugins: function() {
        return GlidePluginManager.getActivePlugins().toString();
    },

    getLatestActivatedPlugins: function(activePluginsBeforeString) {
        var activePluginsBefore = this._sanitizePluginsData(activePluginsBeforeString);
        var activePluginsAfter = this._sanitizePluginsData(GlidePluginManager.getActivePlugins());

        var latestInstalledPlugins = activePluginsAfter.filter(function(plugin) {
            return activePluginsBefore.indexOf(plugin) == -1;
        });

        var specificAppsToUpdate = [];
        latestInstalledPlugins.forEach(function(plugin) {
            var sysCode = plugin.split("=")[0];
            specificAppsToUpdate.push({
                sysCode: sysCode,
                sourceAppId: sysCode
            });
        }, this);

        return specificAppsToUpdate;
    },

    _sanitizePluginsData: function(pluginsData) {
        return pluginsData.toString().slice(1, -1).split(", ");
    },

    type: 'AppManagerCacheHelper'
});
