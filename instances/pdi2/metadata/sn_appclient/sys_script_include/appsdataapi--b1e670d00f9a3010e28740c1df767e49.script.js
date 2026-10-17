/**
 * This API is needed to other scopes access to limited number of private methods on AppData.
 **/
var AppsDataAPI = Class.create();
AppsDataAPI.prototype = {

    appsData: {},
    all: [],

    initialize: function() {
        this.appsData = new AppsData();
    },

    getAppCounts: function() {
        var apps = [];
        try {
            apps = this.appsData.getAllAppsWithVersions(false, false, false, false)['data'];

            return this._getCounts(apps);
        } catch (e) {
            gs.error(e.message);

            return {
                notInstalled: 0,
                updated: 0
            };
        }
    },

    _getCounts: function(apps) {
        var notInstalledCount = 0;
        var updatesCount = 0;

        apps.forEach(function(app) {

            if (this._isUpdate(app))
                updatesCount++;

            if (this._isReadyForInstall(app))
                notInstalledCount++;

        }, this);

        return {
            notInstalled: notInstalledCount,
            updated: updatesCount
        };
    },

    _isUpdate: function(app) {
        return app.version && app.active && app.latest_version != app.version && app.can_install_or_upgrade && app.isInstalledAndUpdateAvailable;
    },

    _isReadyForInstall: function(app) {
        return app.isInstalled === false;
    },

    getAllEntitledApps: function() {
        var apps = [];
        var plugins = [];
        try {
            apps = this.appsData.getAllAppsWithVersions(false, false, false, false)['data'];
            plugins = sn_ua.ScopedUAAppInfo.getAllPluginInfo();
            plugins = plugins.length == 0 ? [] : JSON.parse(plugins);
        } catch (e) {
            gs.error(e.message);
            return [];
        }

        return this._getEntitlementsObj(apps, plugins);
    },

    // Returns apps/plugins matching the sys_ids in a list
    getEntitledApps: function( /*[]*/ list) {
        var apps = [];
        var plugins = [];
        try {
            apps = this.appsData.getAllAppsWithVersions(false, false, false, false)['data'];
            plugins = sn_ua.ScopedUAAppInfo.getAllPluginInfo();
            plugins = plugins.length == 0 ? [] : JSON.parse(plugins);
        } catch (e) {
            gs.error(e.message);
            return [];
        }

        return this._getEntitlementsObj(this._filterAppsOrPlugins(apps, list), this._filterAppsOrPlugins(plugins, list));
    },

    _getEntitlementsObj: function(apps, plugins) {
        var result = [];
        var appMap = {};

        if (apps.length == 0 && plugins.length == 0)
            return result;

        apps.forEach(function(app, index) {
            appMap[app.name] = this._getAppObj(app);
        }, this);

        var ignoredApps = {};
        plugins.forEach(function(plugin, index) {
            if (appMap[plugin.app_name]) {
                var pluginObj = this._getPluginObj(plugin);
                var combinedDependencies = this._mergeDependencies(appMap[plugin.app_name], pluginObj);

                if (this._treatAsPlugin(appMap[plugin.app_name], plugin)) {
                    ignoredApps[plugin.app_name] = true;
                    pluginObj.dependencies = combinedDependencies;
                    result.push(pluginObj);
                } else {
                    appMap[plugin.app_name].dependencies = combinedDependencies;
                }
            } else {
                result.push(this._getPluginObj(plugin));
            }
        }, this);

        for (var i = 0; i < apps.length; i++) {
            if (!ignoredApps[apps[i].name]) {
                result.push(appMap[apps[i].name]);
            }
        }

        return result;
    },

    _mergeDependencies: function(app, plugin) {
        var arrayUtil = new global.ArrayUtil();
        return arrayUtil.union(app.dependencies || [], plugin.dependencies || []);
    },

    _treatAsPlugin: function(app, plugin) {
        return app.latest_version === app.version && !app.isAppstorePlugin && !plugin.is_customized_app;
    },

    _getAppObj: function(app) {
        var appData = this._pick(app,
            ['sys_id', 'isInstalled', 'name', 'short_description', 'scope', 'products', 'price_type', 'latest_version', 'sys_code', 'isAppstorePlugin', 'isInstalledAndUpdateAvailable']);
        appData.isApplication = true;
        appData.entitled = true;
	 if (appData.indicators && appData.indicators.length > 0) {
	    appData.indicators.forEach(function(item) {
            if (item.id == 'not_licensed') {
                appData.entitled = false;
            }
        });
	}
	if (appData.versions && appData.versions.length > 0) {
	    appData.entitled && appData.versions.forEach(function(item, Index) {
            item.indicators.forEach(function(item) {
                if (item.id == 'not_licensed') {
                    appData.entitled = false;
                }
            });
        });
	}
        var hasValidAppVersions = app.versions && Array.isArray(app.versions) && app.versions.length > 0;
        appData.version = hasValidAppVersions ? app.versions[app.versions.length - 1].version : app.version;
        appData.dependencies = hasValidAppVersions ? app.versions[app.versions.length - 1].dependencies : '';

        return appData;
    },

    _getPluginObj: function(plugin) {
        var pluginData = this._pick(plugin, ['sys_id', 'description', 'lob_id', 'lob_name']);
        pluginData.plugin_id = plugin.app_id;
        pluginData.isPlugin = true;
        pluginData.name = plugin.app_name;
        pluginData.isInstalled = plugin.active == 0 ? false : true;
        pluginData.paid = plugin.for_fee == 1;
        pluginData.entitled = plugin.license_check_required == 1 ? plugin.entitled : "not_applicable";
        pluginData.dependencies = this._getPluginDependencies(plugin.app_id);
        pluginData.is_customized_app = plugin.is_customized_app;

        return pluginData;
    },

    _getPluginDependencies: function(plugin_id) {
        var gr = new GlideRecord('v_plugin');
        gr.addQuery('id', plugin_id);
        gr.query();
        gr.next();

        return gr.getValue('requires');
    },

    // Fetches App/Plugin details data. Marketing data for AdminX.
    getStoreAppDetails: function(app_id, version, requiredForPurchase) {
        var appDetails = new AppsData().getStoreAppDetail(app_id, version, requiredForPurchase);
		return appDetails;
    },

    getAppDependencyStatus: function(appScope, dependencies) {
        return new DependencyProcessor(appScope).processDependency(dependencies.split(","));
    },

    // Creates an object composed of the picked object properties
    _pick: function(data, keys) {
        var result = {};

        keys.forEach(function(key) {
            if (data.hasOwnProperty(key)) result[key] = data[key];
        });

        return result;
    },

    _filterAppsOrPlugins: function(appsOrPlugins, sysIdList) {
        var arrayUtil = new global.ArrayUtil();
        return appsOrPlugins.filter(function(i) {
			// Only plugin object has app_id(plugin_id) and for apps use sys_id
            return !gs.nil(i.app_id) ? arrayUtil.contains(sysIdList, i.app_id) : arrayUtil.contains(sysIdList, i.sys_id);
        });
    },

    type: 'AppsDataAPI'
};
