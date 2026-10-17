var PluginInfoHelper = Class.create();
PluginInfoHelper.prototype = {
    initialize: function() {
        this.indicatorKeyMessageMap = {};
        this.indicatorKeyMessageMap[Constants.UNSUPPORTED_ENVIRONMENT_KEY] = gs.getMessage('{0}',Constants.UNSUPPORTED_ENVIRONMENT_LABEL);
        this.pluginData = new global.PluginsData();
        this.appCustomizationAPI = sn_app_customization.AppCustomizationAPI;
    },

    /**
     * Get list of plugins
     * @param apiUtil
     * @returns JSON containing the list of plugins
     */
    getPlugins: function(apiUtil) {
        try {
            var params = apiUtil.getRequestParams();
            var searchExpression = params.queryParams[Constants.SEARCH_EXPRESSION];
            var filterParams = apiUtil.getRequestBody();
            var tabContext = params.queryParams[Constants.TAB_CONTEXT];

            var plugins = this._getAllMatchedPlugins(searchExpression, filterParams, tabContext, apiUtil);
            var response = CommonUtils.getResultByParams(plugins, params.queryParams);
            apiUtil.addTotalCountHeader(plugins.length);
            return response;
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get plugin by Id
     * @param params
     * @returns JSON object containing plugin as the result
     */
    getPlugin: function(params) {
        try {
            var pluginId = params.pathParams[Constants.PLUGIN_ID];
            var plugin = pluginId ? this._getPluginById(pluginId) : {};
            var response = {};
            response[Constants.PLUGIN] = plugin;
            return response;
        } catch (err) {
            throw err;
        }
    },

    _getPluginById: function(pluginId) {
        var allPlugins = this._getAllPluginInfo();
        for (var i = 0; i < allPlugins.length; i++) {
            var plugin = allPlugins[i];
            if (plugin.app_id === pluginId) {
                this._decoratePlugin(plugin);
                return plugin;
            }
        }
        return {};
    },

   _getAllMatchedPlugins: function(searchExpression, filterParams, tabContext, apiUtil) {
       var allPlugins = this._getAllPluginInfo();
       var plugins = searchExpression ? this._filterPlugins(allPlugins, searchExpression) : allPlugins;
       if (filterParams && Object.keys(filterParams).length > 0)
           plugins = this._filterPluginsByFilterParams(plugins, filterParams);

       plugins = this._filterAppResults(plugins, apiUtil);
       var avlPlugins = [];
       var installedPlugins = [];
       var updatePlugins = [];
       var installedOrUpdateScopeArray = [];
       plugins = plugins.forEach(function(plugin) {
           if (plugin.active == "0" || plugin.active == 0)
               avlPlugins.push(plugin);
           else {
               if (plugin.scope !== 'global') installedOrUpdateScopeArray.push(plugin.scope);
               installedPlugins.push(plugin);
           }
       }, this);
       var isUpdatePluginObject = {};
       var gr = new GlideRecord('sys_app_customization');
       gr.addEncodedQuery('vendor_app.scopeIN' + installedOrUpdateScopeArray);
       gr.query();

       while (gr.next()) {
           if (gr.version != gr.latest_version)
               isUpdatePluginObject[gr.vendor_app.scope] = true;
       }

       installedPlugins.forEach(function(plugin) {
           if (isUpdatePluginObject[plugin.scope]) {
	       plugin.update_available = true;
               updatePlugins.push(plugin);
           }
       }, this);

       if (searchExpression) {
           apiUtil.setHeader(Constants.UPDATES_BADGE_COUNT, updatePlugins.length);
           apiUtil.setHeader(Constants.INSTALLED_BADGE_COUNT, installedPlugins.length);
           apiUtil.setHeader(Constants.AVAILABLE_FOR_YOU_BADGE_COUNT, avlPlugins.length);
       }
       if (tabContext == 'available_for_you') return avlPlugins;
       if (tabContext == 'installed') return installedPlugins;
       if (tabContext == 'updates') return updatePlugins;
       return plugins;
   },

    /**
     * Get list of plugins by their product name
     * @param searchExpression
     * @returns [*]
     */
    getAllMatchedPluginsByProductName: function(searchExpression, filterParams) {
        var allPlugins = this._getAllPluginInfo();
        allPlugins = searchExpression ? this._filterPlugins(allPlugins, searchExpression, this._filterPluginsByProductName) : allPlugins;
        allPlugins = (filterParams && Object.keys(filterParams).length > 0) ? this._filterPluginsByFilterParams(allPlugins, filterParams) : allPlugins;
        return allPlugins;
    },

    getAllPluginsByProductId: function(productId) {
        var allPlugins = this._getAllPluginInfo();
        return allPlugins.filter(function(plugin) {
            if (plugin.lineage_id === productId) {
                plugin.customized_version_info = sn_app_customization.AppCustomizationAPI.getInactivePluginCustomizationVersionInfo(plugin.app_id);
                return plugin;
            }
        }, this);
    },

    _getAllPluginInfo: function() {
        try {
            var allPlugins = JSON.parse(this.pluginData.getAllPluginInfo());
            return allPlugins.filter(this._filterScopedPlugins, this);
        } catch (err) {
            var errorString = "Failed to load plugins";
            var error = {};
            error.errorCode = 500;
            error.errorDescription = errorString;
            gs.error(err, errorString);
            throw error;
        }
    },

	_filterAppResults: function(plugins, apiUtil) {
		var appInfoService = new AppInfoService();
		var appsResultData = appInfoService.getApps(apiUtil);
		return plugins.filter(function(plugin) {
			return appsResultData.apps.filter(function(app) {
				return app.scope == plugin.scope || app.sys_code == plugin.app_id;
			}).length == 0;
		}, this);
	},

    _filterPluginsByInstallation: function(plugins, isActive) {
        var filteredPlugins = plugins;
        switch (isActive) {
            case true:
            case 'true':
                filteredPlugins = plugins.filter(function(plugin) {
                    return plugin.active == 1;
                });
                break;
            case false:
            case 'false':
                filteredPlugins = plugins.filter(function(plugin) {
                    return plugin.active == 0;
                });
                break;
            default:
                break;
        }
        return filteredPlugins;
    },

    _filterScopedPlugins: function(plugin) {
        return !plugin.scope.toLowerCase().startsWith(Constants.SCOPED_PLUGIN_PREFIX);
    },

    _filterPluginsByMultipleParameters: function(plugin) {
        var regex = this;
        var name = plugin.app_name;
        var id = plugin.app_id;
        var description = plugin.description;
        var scope = plugin.scope;
        var lineageName = plugin.lineage_name;

        return regex.test(name) || regex.test(id) || regex.test(scope) || regex.test(lineageName) || regex.test(description);
    },

    _filterPluginsByProductName: function(plugin) {
        var regex = this;
        var lineageName = plugin.lineage_name;
        return regex.test(lineageName);
    },

    _filterPlugins: function(plugins, searchExpression, customFilter) {
        var searchType = CommonUtils.getSearchType(searchExpression);
        var keyword = CommonUtils.getSearchKeyword(searchExpression);
        var regexEscapedKeyword = CommonUtils.getEscapedRegExp(keyword);
        var regex = (searchType == Constants.SEARCH_FOR_EXACT_MATCH) ? new RegExp('^' + regexEscapedKeyword + '$', 'i') : new RegExp(regexEscapedKeyword, 'i');

        var filteredPlugins = customFilter ? plugins.filter(customFilter, regex) : plugins.filter(this._filterPluginsByMultipleParameters, regex);

        return filteredPlugins;
    },

    _filterPluginsByFilterParams: function(plugins, filterParams) {
        var LOBs = [];
        var productFamily = [];
        var adoptionBluePrint = [];
        var offeredBy = [];
        var listings = [];

        if (filterParams.hasOwnProperty('productFamily'))
            LOBs = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('productFamily'))
            productFamily = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('offeredBy'))
            offeredBy = filterParams['offeredBy'];
        if (filterParams.hasOwnProperty('adoptionBlueprint'))
            adoptionBluePrint = filterParams['adoptionBlueprint'];
        if (filterParams.hasOwnProperty('listings'))
            listings = filterParams['listings'];

        if (offeredBy.indexOf('partners') != -1 && offeredBy.indexOf('servicenow') == -1)
            return [];
        var isfreeToTryPresent = listings.indexOf('free_to_try') != -1;
        var pluginsAfterListings = [];
        if (isfreeToTryPresent)
            for (var i = 0; i < plugins.length; i++) {
                if (plugins[i].for_fee == 0)
                    pluginsAfterListings.push(plugins[i]);
            }
        if (isfreeToTryPresent)
            plugins = pluginsAfterListings;

        var pluginsAfterProductFamily = [];
        if (LOBs.length > 0 || productFamily.length > 0)
            for (i = 0; i < plugins.length; i++) {
                for (var j = 0; j < LOBs.length; j++) {
                    alreadyAdded = false;
                    if (plugins[i].lob_name === LOBs[j]) {
                        pluginsAfterProductFamily.push(plugins[i]);
                        alreadyAdded = true;
                    }
                }
                for (j = 0; j < productFamily.length; j++) {
                    if (plugins[i].lineage_name === productFamily[j] && !alreadyAdded)
                        pluginsAfterProductFamily.push(plugins[i]);
                }
            }
        if (LOBs.length > 0 || productFamily.length > 0)
            plugins = pluginsAfterProductFamily;
        var pluginsAfterABP = [];
        if (adoptionBluePrint != null && adoptionBluePrint.length > 0) {
            adoptionBluePrintQuery = this.getEncodedQueryByAdoptionBluePrint(adoptionBluePrint);
            pluginIDs = new AppManagerFiltersUtil().getFilteredPluginIdsWithAdoptionBluePrint(adoptionBluePrintQuery);
            var hashmap = {};
            if (pluginIDs != null && pluginIDs.length > 0)
                for (i = 0; i < pluginIDs.length; i++) {
                    var id = pluginIDs[i];
                    hashmap[id] = true;
                }
            for (i = 0; i < plugins.length; i++) {
                if (hashmap.hasOwnProperty(plugins[i].app_id))
                    pluginsAfterABP.push(plugins[i]);
            }
            plugins = pluginsAfterABP;
        }
        return plugins;
    },
    
    getEncodedQueryByAdoptionBluePrint: function(adoptionBluePrint) {
        var adoptionBluePrintQuery = "";
        for (var i = 0; i < adoptionBluePrint.length; i++) {
            if (i > 0) adoptionBluePrintQuery += "^OR";
            adoptionBluePrintQuery += "objective.sys_id=" + adoptionBluePrint[i];
        }
        return adoptionBluePrintQuery;
    },
	_appendStudioURL: function(plugin) {
		var edit_in_studio_url = "";
		var open_in_studio_url = "";

		try {
			// Check if UDC StudioUtils is available
			if (typeof sn_udc.StudioUtils !== 'undefined') {
				try {
					var studioAppDetailsPageURL = sn_udc.StudioUtils.getAppDetailsPageURL(plugin.packageID);

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
				open_in_studio_url = this._constructLegacyStudioURL(plugin, 'sys_id');
				edit_in_studio_url = this._constructLegacyStudioURL(plugin, 'packageID');
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
		return "/$studio.do?sysparm_transaction_scope=" + id + "&sysparm_nostack=true&sysparm_use_polaris=false";
	},


    _decoratePlugin: function(plugin) {
        plugin.isPlugin = true;
        plugin.name = plugin.app_name;
        plugin.id = plugin.app_id;
        plugin.isInstalled = plugin.active == 0 ? false : true;
        if (plugin.isInstalled) {
        	var gr = new GlideRecord("v_plugin");
        	gr.get(plugin.sys_id);
        	plugin.has_demo_data = gr.getValue("has_demo_data");
        	plugin.version = gr.getValue("version");
        	var appsData = new AppsData();
        	plugin.upgradeHistoryId = new AppUpgrader().getLatestUpgradeHistory(plugin.id);
        	plugin.installedFilesQuery = appsData.getInstalledFilesQuery(plugin.id);
        	plugin.pluginFilesInfo = this.getPluginFilesInfo(plugin);
        	plugin.upgradeDetailsInfo = appsData.getUpgradeInfo(plugin.upgradeHistoryId);
        	var installationInfo = {};
        	installationInfo.installation_log = appsData.getInstallationInfo(plugin.sys_id, plugin.scope);
        	installationInfo.installed_files = this.getPluginFilesInfo(plugin);
        	installationInfo.customized_files = appsData.getCustomizedFiles(plugin.packageID);
        	plugin.installationInfo = installationInfo;
        	plugin.new_guided_setup_id = new AppsData().getNewGuidedSetupId(plugin.packageID);
            plugin.can_rollback = this.pluginData.canRollbackPlugin(plugin.id);
        }
        var adminCenterGr = new GlideRecord("sn_admin_center_application");
        adminCenterGr.addQuery('plugin_id', plugin.app_id);
        adminCenterGr.query();
        if(adminCenterGr.next()){
        	plugin.pluginDoc  = gs.xmlToJSON(adminCenterGr.documentation.toString());
        	plugin.key_features  = adminCenterGr.getValue("key_features");
        }

        plugin.free = plugin.for_fee == 0;
        plugin.paid = plugin.for_fee == 1;
        plugin[Constants.ALL_LOBS] = [plugin.lob_id];
        plugin.isOutOfBandApp = (plugin.scope.toLowerCase().startsWith(Constants.SERVICE_NOW_PREFIX) && plugin.id.toLowerCase() == plugin.scope.toLowerCase()) ? true : false;

        plugin.is_customized_app = this.appCustomizationAPI.isInactivePluginCustomizedApp(plugin.id);
        if (plugin.is_customized_app)
            plugin.can_install_or_upgrade_customization = true;

        plugin.can_edit_in_studio = false;
        plugin.can_open_in_studio = false;
        if (plugin.active === "1" && plugin.scope !== Constants.GLOBAL) {
            var isCustomizationSupported = this.appCustomizationAPI.isAppCustomizationCapableByScopeName(plugin.scope);
            var canEditInStudio = this.appCustomizationAPI.isEditableInStudio(plugin.scope);
            plugin.can_edit_in_studio = canEditInStudio && isCustomizationSupported;
            plugin.can_open_in_studio = !canEditInStudio && isCustomizationSupported;
			if(plugin.can_edit_in_studio || plugin.can_open_in_studio) {
				this._appendStudioURL(plugin);
			}
            if (plugin.is_customized_app)
                plugin.can_install_or_upgrade_customization = this.appCustomizationAPI.canInstallOrRepairCustomization(plugin.scope);
        }
        plugin.customized_version_info = this.appCustomizationAPI.getInactivePluginCustomizationVersionInfo(plugin.id);
        plugin.indicators = this._generateIndicatorList(plugin.indicators);
        var pluginScheduleDetails = new ScheduledInstallService().fetchActiveSchedulesForEntity({source_app_id: plugin.id.toString()});
        plugin.plugin_schedule_details = CommonUtils.formatScheduleDetailsStartTime(pluginScheduleDetails, plugin.id);
        var tracker = new ProgressTracker().getInProgressInstallationByAppId(plugin.app_id);
        plugin.install_tracker_id = tracker.id;
        plugin.userDateFormat = gs.getDateFormat();
        if(tracker.id)
	        plugin.tracker = tracker;
    },

	getPluginFilesInfo: function(plugin) {

	    var pluginFiles = new GlideRecord("sys_metadata");
	    var packageID = "-1";
	    var scopeName = plugin.scope;
	    var scope = new GlideRecord("sys_scope");
	    if (scopeName !== "global" && scope.get("scope", scopeName)) {
	        packageID = scope.getUniqueValue();
	        var files = new GlideRecord("sys_metadata");
	        files.addQuery("sys_package", packageID);
	        files.query();
	        var customerFileIds = new global.UpdateVersionAPI().getCustomerFileIds(files);
	        if (customerFileIds.length > 0)
	            pluginFiles.addQuery("sys_id", "NOT IN", customerFileIds);
	    } else {
	        var pluginsGR = new GlideRecord("sys_plugins");
	        if (pluginsGR.get("source", plugin.id)) packageID = pluginsGR.getUniqueValue();
	    }
	    pluginFiles.addQuery("sys_package", packageID);
	    plugin.packageID = packageID;
	    pluginFiles.query();
	    return {
	        query: this.pluginData.getTinyURL(Constants.INSTALLED_FILES + pluginFiles.getEncodedQuery()),
	        count: pluginFiles.getRowCount()
	    };
	},

    _generateIndicatorList: function(indicators) {
        var list = [];
        var keys = JSON.parse(indicators || '[]');
        keys.forEach(function(key) {
            list.push(this._getIndicator(key));
        }, this);
        return list;
    },

    _getIndicator: function(key) {
        var indicator = {};
        indicator.id = key;
        var message = this.indicatorKeyMessageMap[key];
        if (!message) {
            message = key.split('_').join(' ');
            message = message.charAt(0).toUpperCase() + message.slice(1);
        }
        indicator.message = message;
        return indicator;
    },

    type: 'PluginInfoHelper'
};
