var PluginsData = Class.create();
PluginsData.prototype = {
    initialize: function() {},

    refreshPluginCache: function(userPluginData) {
        var existingTracker = this.isRefreshInProgress();
        if (!gs.nil(existingTracker))
            return existingTracker;
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName("Update plugin cache");
        worker.setBackground(true);
        worker.setCannotCancel(true);
        worker.setScriptIncludeName("global.PluginsData");
        worker.setScriptIncludeMethod("getPlugins");
        worker.putMethodArg("userPluginData", userPluginData);
        worker.start();
        return worker.getProgressID();
    },

    updateJumboPlugin: function(gr, appPackageInfo) {
        // Update the found record with dependencies from appPackageInfo
        gr.setValue("conditional_dependencies", (appPackageInfo.dependencies.conditional || []).toString());
        gr.setValue("hard_dependencies", (appPackageInfo.dependencies.hard || []).toString());
        gr.setValue("optional_dependencies", (appPackageInfo.dependencies.optional || []).toString());
        gr.setValue("soft_dependencies", (appPackageInfo.dependencies.soft || []).toString());

        // Update the record
        gr.update();
        return gr.getUniqueValue();
    },

    isRefreshInProgress: function() {
        var gr = new GlideRecord("sys_progress_worker");
        gr.addQuery("name", "Update plugin cache");
        gr.addQuery("state", 'IN', "starting,running");
        gr.orderByDesc("sys_created_on");
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var currentDateTime = new GlideDateTime().getNumericValue();
            var progressWorkerCreatedTime = new GlideDateTime(gr.sys_created_on).getNumericValue();
            if ((currentDateTime - progressWorkerCreatedTime) > 3600000)
                return "";
            return gr.getUniqueValue();
        }
        return "";
    },

    getAllPluginInfo: function() {
        try {
            return SNC.UAAppInfo.getAllPluginInfo();
        } catch (e) {
            gs.log(e, "Plugin list access attempted by a non admin user");
            return "[]";
        }
    },
	_appendStudioURL: function(plugin) {
		var edit_in_studio_url = "";
		var open_in_studio_url = "";

		try {
			// Check if UDC StudioUtils is available/installed
			if (typeof sn_udc.StudioUtils !== 'undefined') {
				try {
					var studioAppDetailsPageURL = sn_udc.StudioUtils.getAppDetailsPageURL(plugin.store_app_sys_id); // using store_app_sys_id instead of packageID (as in new app manager)

					if (studioAppDetailsPageURL) {
						open_in_studio_url = studioAppDetailsPageURL;
						edit_in_studio_url = studioAppDetailsPageURL;
					} else {
						// Studio App Details URL could not be generated. Falling back to home page URL
						open_in_studio_url = sn_udc.StudioUtils.getHomePageURL();
						edit_in_studio_url = open_in_studio_url;
					}
				} catch(error) {
					// Unknown error - Falling back to home page URL
					open_in_studio_url = sn_udc.StudioUtils.getHomePageURL();
					edit_in_studio_url = open_in_studio_url;
				}
			} else {
				// UDC StudioUtils not available. Using legacy static URL
				open_in_studio_url = this._constructLegacyStudioURL(plugin, 'store_app_sys_id');
				edit_in_studio_url = this._constructLegacyStudioURL(plugin, 'store_app_sys_id'); // using store_app_sys_id instead of packageID (as in new app manager)
			}
		} catch (e) {
			// Log error and use fallback URL
			gs.error("Error in _appendStudioURL: " + e);
			open_in_studio_url = ""; // give empty URL and disable/hide button on UI
			edit_in_studio_url = open_in_studio_url;
		}

		// Set the URLs on the plugin object
		plugin.edit_in_studio_url = edit_in_studio_url;
		plugin.open_in_studio_url = open_in_studio_url;
	},

	_constructLegacyStudioURL: function(plugin, idType) {
		// Constructs the legacy Studio URL based on the given ID type
		var id = plugin[idType];
		return "/$studio.do?sysparm_transaction_scope=" + id + "&sysparm_nostack=true"; // &sysparm_use_polaris=false
	},

    getPlugins: function(userPluginData) {
        var allPlugins = gs.nil(userPluginData) ? this.getAllPluginInfo() : userPluginData;
        var encodedResponse = new global.JSON().decode(allPlugins);
        var plugins = [];
		for(var i = 0; i < encodedResponse.length; i++) {
			var plugin = encodedResponse[i];
            if (plugin.scope.toLowerCase().startsWith("x_"))
                return;
            plugin.isPlugin = true;
            plugin.name = plugin.app_name;
            plugin.id = plugin.app_id;
            plugin.isInstalled = plugin.active == 0 ? false : true;
            plugin.free = plugin.for_fee == 0;
            plugin.paid = plugin.for_fee == 1;
            plugin["all_lobs"] = [plugin.lob_id];
            plugin.isOutOfBandApp = (plugin.scope.toLowerCase().startsWith("sn_") && plugin.id.toLowerCase() == plugin.scope.toLowerCase()) ? true : false;

            plugin.is_customized_app = sn_app_customization.AppCustomizationAPI.isInactivePluginCustomizedApp(plugin.id);
            if (plugin.is_customized_app)
                plugin.can_install_or_upgrade_customization = true;

            plugin.can_edit_in_studio = false;
            plugin.can_open_in_studio = false;
            if (plugin.active === "1" && plugin.scope !== "global") {
                var storeAppGR = new GlideRecord("sys_store_app");
                storeAppGR.addQuery("scope", plugin.scope);
                storeAppGR.setLimit(1);
                storeAppGR.query();
                if (storeAppGR.next()) {
                    var isCustomizationSupported = sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableByScopeName(plugin.scope);
                    var canEditInStudio = storeAppGR.can_edit_in_studio == true ? true : false;
                    plugin.can_edit_in_studio = canEditInStudio && isCustomizationSupported;
                    plugin.can_open_in_studio = !canEditInStudio && isCustomizationSupported;
                    plugin.store_app_sys_id = storeAppGR.getUniqueValue();
					if(plugin.can_edit_in_studio || plugin.can_open_in_studio) {
						this._appendStudioURL(plugin);
					}
                    if (plugin.is_customized_app)
                        plugin.can_install_or_upgrade_customization = sn_app_customization.AppCustomizationAPI
                        .canInstallOrRepairCustomization(plugin.store_app_sys_id);
                }
            }

            plugin.customized_version_info = sn_app_customization.AppCustomizationAPI.getInactivePluginCustomizationVersionInfo(plugin.id);
            plugin.indicators = this.generateIndicatorObjectList(plugin.indicators);

            plugins.push(plugin);
        }
        new global.AppManagerCache().putResponseInCache("pluginResponse", plugins);

        return plugins;
    },

    getpluginsdata: function(isFirstLoad, forceCallLUA) {
        var result = {};
        var pluginResponseFromCache = new global.AppManagerCache().getResponseFromCache("pluginResponse");

        if (gs.nil(pluginResponseFromCache) || forceCallLUA) {
            pluginResponseFromCache = this.getPlugins();
        }

        if (isFirstLoad) {
            var userPluginData = gs.getUser().hasRole("maint") ? SNC.UAAppInfo.getAllPluginInfo() : '';
            result.pluginTrackerId = this.refreshPluginCache(userPluginData);
        }

        result.pluginData = pluginResponseFromCache;
        return result;
    },

    generateIndicatorObjectList: function(indicatorKeys) {
        var indicatorKeyMessageMap = {
            "unsupported_environment": gs.getMessage("Unsupported Environment"),
        };

        var indicatorObjList = [];
        var parsedKeys = JSON.parse(indicatorKeys || '[]');
        parsedKeys.forEach(function(key, index) {
            indicatorObjList[index] = {
                id: key,
                message: indicatorKeyMessageMap[key]
            };
        });

        return indicatorObjList;
    },
    getLOBCategories: function() {
        return new global.JSON().decode(SNC.UAAppInfo.getLOBCategories());
    },

    checkNoActivateTagInPluginDefn: function(pluginGR) {
        return gs.getXMLText(pluginGR.definition, "//no_activate") != "true";
    },

    checkPluginInstallationAllowed: function() {
        return new PluginActivationVisible().isInstallationAllowed();
    },

    getUninstalledConditionalPlugins: function(pluginId) {
        var inActiveConditionalPlugin = GlidePluginManager.getUninstalledConditionalPlugins(pluginId);
        inActiveConditionalPlugin.query();
        var inActiveConditionalPlugins = [];
        while (inActiveConditionalPlugin.next()) {
            inActiveConditionalPlugins.push({
                "name": inActiveConditionalPlugin.getValue("name"),
                "sys_id": inActiveConditionalPlugin.getValue("id")
            });
        }
        return inActiveConditionalPlugins;
    },

    getAndClearSessionInfo: function(keys, result) {
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            try {
                result[key] = gs.getSession().getClientData(key) || "";
                if (result[key])
                    gs.getSession().clearClientData(key);
            } catch (err) {}
        }
    },
    
    getUpgradeHistoryInfo: function(encodedQuery) {
    	var upgradeHistory = new GlideRecord('sys_upgrade_history_log');
    	upgradeHistory.addEncodedQuery(encodedQuery);
    	upgradeHistory.query();
    	return {count: upgradeHistory.getRowCount(), query: encodedQuery};
    },

    loadDemoData: function(plugin_id) {
        var worker = new GlidePluginManagerWorker();
        var progress_name = "load demo data";
        worker.setProgressName(progress_name);
        worker.setPluginId(plugin_id);
        worker.setBackground(true);
        worker.setLoadDemoDataOnly(true);
        worker.setIncludeDemoData(true);
        worker.start();
        return worker.getProgressID();
    },

    canRollbackPlugin : function(plugin_id) {
        return GlidePluginManager.canRollback(plugin_id);
    },

    rollbackPlugin: function(plugin_id) {
        var rctxid = GlidePluginManager.getRollbackContextId(plugin_id);
        var worker = new GlideRollbackWorker();
        worker.setRollbackContextID(rctxid);
        worker.setProgressName("Executing Rollback");
        worker.setBackground(true);
        worker.start();		
        var trackerId = worker.getProgressID();
        return {trackerId:trackerId , rctxid:rctxid};
    },

    getRollbackRunId : function(rctxid){
        var rrid = GlidePluginManager.getRollbackRunId(rctxid);
        return rrid;
    },

    getPluginDetailsById: function(pluginId) {
        var response = {
            name: pluginId,
            id: pluginId,
            dependencies: [],
            userVisibility: false
        };
        var plugin = GlidePluginManager.getInstalledPlugin(pluginId);
        if (!plugin || gs.nil(plugin)) return response;

        var dependencies = GlidePluginManager.getPluginDependencies(pluginId);

        response.name = plugin.getDisplayName();
        response.id = plugin.getName();
        response.userVisibility = true;
        response.dependencies = dependencies ? JSON.parse(dependencies) : [];

        return response;
    },

    getTinyURL: function(url) {
        return new GlideTinyURL().createTinyURLWithCustomLength(url, 10);
    },

	getLicenseInfoByPluginId: function(pluginID) {
		var appLicenseInfo = {};
		try {
			var entitledBO = new sn_entitlement.GlideEntitlementAPI().getLicenseDetailsForArtifact('app_id', pluginID);
			appLicenseInfo.has_license = entitledBO.getIsEntitled();
			appLicenseInfo.is_allowed_install = entitledBO.getIsPermitted();
		}catch(error) {
			gs.info("Error occured while processing license info for Plugin ID: {0}, falling back to legacy. ", pluginID);
		}
		return appLicenseInfo;
	},

    type: 'PluginsData'
};
