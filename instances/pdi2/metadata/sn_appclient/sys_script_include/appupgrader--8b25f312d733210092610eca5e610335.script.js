var AppUpgrader = Class.create();
AppUpgrader.prototype = {

	CANNOT_INSTALL_OR_UPDATE : gs.getMessage("Insufficient privileges to install or update an application package:"),
	DELETE_OLD_APP_PACKAGE : gs.getMessage("Deleting old application package"),
	INSTALL_APP_PACKAGE : gs.getMessage("Installing application package"),
	APP_IS_NOT_AVAILABLE: "Application unavailable for installation on this instance, app id: {0}",
	NO_ASSIGNED_VERSION: "Aborting upgrade of application: {0}, no assigned version specified",
	NO_UPGRADE_NECESSARY: "Application is already on desired version ({0}), no upgrade necessary for {1}",
	CANT_DOWNGRADE: "Application cannot be downgraded: {0}, from version: {1}, to version: {2}",
	PLUGIN_DEPENDENCY_UNAVAILABLE: "Aborting installation of application: {0}, application depends on plugins which are not available on this instance: {1}",
	APP_DEPENDENCY_UNAVAILABLE: "Aborting installation of application: {0}, application depends on other applications which are not accessible at app store: {1}",
	REFRESH_APP_CACHE : gs.getMessage("Refreshing app cache"),

    initialize: function() {
		this._instanceId = gs.getProperty("instance_id");
		this._instanceName = gs.getProperty("instance_name");
		this._autoUpdateEnabled = gs.getProperty('sn_appclient.auto_update', 'true') == 'true';
		this.versionComparator = new VersionComparator();
		this.glideAppLoader = new GlideAppLoader();
		this._PARENT_TRACKER = GlideExecutionTracker.getLastRunning();
		this._isCustomizationInstall = false;
		this._isStoreAppInstall = true;
		this._isJumboAppInstall = false;
		this._offeringPluginId = '';
		this._optionalDependencies = [];
    },

	autoUpdates: function() {
		var updates = this._getAutoUpdates();
		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			this.upgradeProcess(update.source_app_id, update.latest_version, false, true);
		}
	},

	/***
	 * Installs or updates store app for dependent apps or installing an app during the upgrade
	 * jumboAppArgs: json string like the following
	 * {
	 *  "isJumboAppInstall": "true",
	 *  "offering": "com.llama_farm_pro",
	 *  "optional_dependencies": ["com.sn_lf_admin_console:sys", "com.sn_llama_global:sys", "com.sn_llama_farm_extra_beds:sys", "com.sn_llama_farm_hats:sys"]
	 * }
	 */
	upgrade: /*boolean*/ function(/*source_app_id*/ appID, /*String*/ appVersion, /*String*/ loadDemoData, /*String*/ customizationVersion, /*String*/ jumboAppArgs, /*Boolean*/ isInteractiveInstall) {
		return this.upgradeProcess(appID, appVersion, loadDemoData, false, false, '', customizationVersion, jumboAppArgs, isInteractiveInstall);
	},

	/***
	 * Installs or updates the root store app from the UI or autoUpdate schedule job
	 */
	upgradeProcess: /*boolean*/ function(/*source_app_id*/ appID, /*String*/ appVersion, /*String*/ loadDemoData, obtainMutex,/*boolean*/ isReinstallRequested, /*String*/ additionalArgs, /*String*/ customizationVersion, /*String*/ subscription, /*String*/ jumboAppArgs, /*Boolean*/ isInteractiveInstall) {
		gs.info("upgrade(): appID={0}, version={1}, customizationVersion={2}, loadDemoData={3}, reinstall={4}", appID, appVersion, customizationVersion, loadDemoData, isReinstallRequested);
		gs.info("upgrade(): subscription={0}, jumboAppArgs={1}", subscription, jumboAppArgs);

		if (!this._parseJumboAppArgs(jumboAppArgs, appID))
			return false;

		this.installationStartTime = new GlideDateTime().getValue();
		this.customizationVersion = customizationVersion;
		var customization = this._getCustomization(appID, customizationVersion);
		var storeApp = this._getOrCreateStoreApp(appID, appVersion);

		if (!storeApp) {
			gs.error("Unable to create sys_store_app for " + appID);
			this._PARENT_TRACKER.fail(sn_i18n.Message.getMessage("AppUpgrader", "Unable to create sys_store_app for {appId}", {appId: appID}));
			return false;
		}

		this.activePluginsBefore = new global.AppManagerCacheHelper().getActivePlugins();

		// ******* VALIDATION ********
		// if these fail the tracker fails
		if (!this._shouldInstallOrUpgrade(storeApp, appVersion, appID))
            return false;

		if (this._isCustomizationInstall && !this._shouldInstallOrUpgrade(customization, customizationVersion, appID))
            return false;

		this._isStoreAppInstall = this._shouldInstallOrUpgradeStoreApp(storeApp, appVersion, isReinstallRequested);
		if (this._isStoreAppInstall && !this._checkStoreAppDependencies(storeApp, appVersion))
            return false;

        if (this._isCustomizationInstall)
            this._isCustomizationInstall = this._shouldInstallOrUpgradeCustomization(customization, customizationVersion, isReinstallRequested);

		if (!this._isStoreAppInstall && !this._isCustomizationInstall) {
            msg = gs.getMessage(this.NO_UPGRADE_NECESSARY, [appVersion, app.sys_id]);
            gs.info(msg);
            this._PARENT_TRACKER.success(msg);
            return true;
		}
		// ******* VALIDATION END ********

        if (this._isStoreAppInstall) {
            //PRB1320429: Dependent Apps skip loading conditional content of parent - figure out all app dependencies for the app.
            var dependencyObj = {sysStoreApp: [], sysRemoteApp: []};
            if (!this._isJumboAppInstall)
              dependencyObj = this.getAllSNScopeDependencies({sysStoreApp: [], sysRemoteApp: []}, storeApp.scope);

            this._updateStoreAppRecords(storeApp, appVersion, subscription, additionalArgs);
        }

        if (this._isCustomizationInstall) {
			customization.assigned_version = customizationVersion;
			customization.update();
        }

		var installTracker = this._PARENT_TRACKER.createChildIfAbsent(this.INSTALL_APP_PACKAGE);
		installTracker.run();
		installTracker.incrementPercentComplete(2);

        var msg = gs.getMessage("Unable to complete install successfully");
        var demoData = (typeof loadDemoData == 'boolean') ? loadDemoData : loadDemoData == 'true';
		
		var args = {};
		// Install Customization if exists
		if (this._isCustomizationInstall) {
            if (!this._installCustomizationPackage(customization, storeApp, demoData, obtainMutex, isInteractiveInstall)) {
                var error = gs.getMessage("Unable to successfully install customizations {0}:{1}", [storeApp.name, appVersion]);
                if (this._failTrackerIfNeeded(installTracker, error))
                   this._PARENT_TRACKER.fail(error);
                this.forceSyncWithStore({appId: appID, appVersion: appVersion, callerPath: "upgradeProcess:customization_install_failed"});
                return false;
            }
            msg = ("Successfully installed customization version {0} for application {1}:{2}", customization.appVersion, storeApp.name, storeApp.appVersion);
            args = this.getCustomizationsBaseApps(storeApp);
			
		} else if (this._isStoreAppInstall) {
            // Install new or repair app package
            if (!this._installApplicationPackage(storeApp, demoData, obtainMutex, isReinstallRequested, isInteractiveInstall)) {
                var error = gs.getMessage("Unable to successfully install application package {0}:{1}", [storeApp.name, appVersion]);
                if (this._failTrackerIfNeeded(installTracker, error))
                    this._PARENT_TRACKER.fail(error);
                    this.forceSyncWithStore({appId: appID, appVersion: appVersion, callerPath: "upgradeProcess:app_package_install_failed"});
                    return false;
            }

			msg = ("Successfully installed application {0}:{1}", storeApp.name, storeApp.appVersion);
			
			//if we got this far, we can safely remove the old sys_app_version records
			//any newer versions will be downloaded next time UpdateChecker runs
			this._removeAppVersions(appID, appVersion);

			//update installation info for the latest installed apps
			//this will filter the existing installed apps from the current installed apps and stamp the installation info this is work around for the dependent apps
			this.updateInstallationInfoOnLatestInstalledApps(additionalArgs);

			//BEGIN: PRB1320429: Dependent Apps skip loading conditional content of parent
			if (typeof this.glideAppLoader.loadConditionalContent != "undefined") {
				for (var i = 0; i < dependencyObj.sysRemoteApp.length; i++) {
					gs.info("Loading conditional content post install {0}", dependencyObj.sysRemoteApp[i]);
					this.glideAppLoader.loadConditionalContent(dependencyObj.sysRemoteApp[i], true);
				}
			}
			args = this.getAppsToBeUpdatedInCache();
		}
		if(gs.getProperty("sn_appclient.enable_app_manager_cache", "true") == "true")
			this.updateAppsPluginsCache(args);
		gs.info(msg);
		this.forceSyncWithStore({appId: appID, appVersion: appVersion, callerPath: "upgradeProcess:install_success"});
		
		installTracker.success();
		this.captureInstallationAnalytics(storeApp);
		return true;
	},

	forceSyncWithStore: function(appContext) {
		if(gs.getProperty("glide.apps.force_sync_post_install_or_uninstall", "true") == "true") {
			try {
				new UpdateChecker().checkAvailableUpdates(false, false, {}, true);
			} catch(err) {
				var errStack = (err.message && err.stack) ? (err.message + "\n" + err.stack) : (err.stack || err.message || err);
				var errMsg = appContext
					? ["Sync with store failed post installation of an app: {0}. {1}", JSON.stringify(appContext), errStack]
					: ["Sync with store failed post installation of an app. {0}", errStack];
				gs.error.apply(null, errMsg);
			}
		}
	},

	captureInstallationAnalytics: function(storeApp) {
		var installationStartTime = new GlideDateTime(this.installationStartTime).getNumericValue();
		var installationEndTime = new GlideDateTime().getNumericValue();
		var installationTime = (installationEndTime - installationStartTime)/1000;
		var data = {};
		if (this._isJumboAppInstall)
			data.app_id = this._offeringPluginId;
		else
			data.app_id = storeApp.sys_id.toString();

		data.time = installationTime.toFixed(2);
		data.entity_type = storeApp.shared_internally.toString() == "true" ? "Company Application" : "Store Application";
		data.version = storeApp.assigned_version.toString();
		new AppClientGCFUtil().recordEvent("app_install", "installation_time", data);
    },

	//this will update cache for installed apps and plugins
	updateAppsPluginsCache: function(args) {
        this.refreshInstalledAppsInCache(args);
        this.refreshActivatedPluginsInCache();
    },

    refreshInstalledAppsInCache: function(args) {
        var sysIdList = [];
        args.specificAppsToUpdate.forEach(function(app) {
            sysIdList.push(app.sourceAppId);
        });

        //DEF0334116 : Use GlideRecord instead of GlideRecordSecure
        var useGlideRecord = true;
        
        var apps = [];
        var appsData = new AppsData();
        appsData._addInstalledApps(apps, args.sharedInternally, sysIdList, useGlideRecord);
        appsData._addVersionsToApps(apps);

        args.appsList = apps;

        new global.AppManagerCache().removeAndAppendCorrectAppsInCache(args);
    },

    refreshActivatedPluginsInCache: function() {
        var latestActivatedPlugins = new global.AppManagerCacheHelper().getLatestActivatedPlugins(this.activePluginsBefore);
        var args = {
            specificAppsToUpdate: latestActivatedPlugins,
            sharedInternally: false
        };

        new global.AppManagerCache().updateInstalledPluginsInCache(args);
    },

    getCustomizationsBaseApps: function(storeApp) {
        var specificAppsToUpdate = [];
        specificAppsToUpdate.push({
            sourceAppId: storeApp.sys_id.toString(),
            scope: storeApp.scope.toString(),
            sysCode: storeApp.sys_code.toString()
        });
        var args = {
            specificAppsToUpdate: specificAppsToUpdate,
            sharedInternally: false
        };

        return args;
    },

    getAppsToBeUpdatedInCache: function() {
        var specificAppsToUpdate = [];
        var installedAppsGr = this.getActiveStoreAppsInInstallationWindow();
        var sharedInternally = false;
        while (installedAppsGr.next()) {
            specificAppsToUpdate.push({
                sourceAppId: installedAppsGr.sys_id.toString(),
                scope: installedAppsGr.scope.toString(),
                sysCode: installedAppsGr.sys_code.toString()
            });
            sharedInternally = installedAppsGr.shared_internally.toString() == "true";
        }
        var args = {
            specificAppsToUpdate: specificAppsToUpdate,
            sharedInternally: sharedInternally
        };

        return args;
    },

    getAllSNScopeDependencies: function(obj, scope){
      var dependencyArr = [];
      var grStoreApp = new GlideRecord("sys_store_app");
      grStoreApp.addQuery("scope",scope);
      grStoreApp.query();
      if(grStoreApp.next()){
        if(grStoreApp.active.toString() === "true")
          obj.sysStoreApp.push(scope);
        else
          obj.sysRemoteApp.push(scope);
        dependencyArr = grStoreApp.dependencies.toString().split(",");
      } else {
        var grRemoteApp = new GlideRecord("sys_remote_app");
        grRemoteApp.addQuery("scope",scope);
        grRemoteApp.query();
        if(grRemoteApp.next()){
          obj.sysRemoteApp.push(scope);
          dependencyArr = grRemoteApp.dependencies.toString().split(",");
        }
      }
      for(var i = 0; i < dependencyArr.length; i++) {//go through all dependencies
        var depPair = dependencyArr[i].split(":");
        if(depPair.length == 2
                && depPair[1] != "sys"
                && depPair[0] != "global"
                && obj.sysStoreApp.indexOf(depPair[0]) == -1
                && obj.sysRemoteApp.indexOf(depPair[0]) == -1){//make sure arr doesnt have this scope already. avoiding infinite loop
          obj = this.getAllSNScopeDependencies(obj, depPair[0]);//figure out the dependencies
        }
      }
      return obj;
    },

    _getCustomization: /*GlideRecord sys_app_customization*/ function(/*String*/ appID, /*String*/ customizationVersion) {
			if (gs.nil(customizationVersion) || customizationVersion == "none") {
				this._isCustomizationInstall = false;
				return null;
			}

    		var customization = new GlideRecord("sys_app_customization");
			customization.addQuery("vendor_app", appID);
			customization.query();
    		if (customization.next()) {
				this._isCustomizationInstall = true;
				this._checkAndDownloadManifest(appID, customizationVersion);
				return customization;
			}
    },
	
   _checkAndDownloadManifest: function(/*String*/vendorAppSourceAppId, /*String*/ customizationVersion) {
		gs.info("_checkAndDownloadManifest(): vendorSourceAppId: {0} customizationVersion: {1}", [vendorAppSourceAppId, customizationVersion]);
		var customizationVersions = new GlideRecord("sys_app_customization_version");
		customizationVersions.addQuery("vendor_app_id", vendorAppSourceAppId);
		customizationVersions.addQuery("version", customizationVersion);
		customizationVersions.addNullQuery("manifest");
		customizationVersions.query();
		while (customizationVersions.next()) {
		    var version = customizationVersions.getValue("version");
		    var app_id = customizationVersions.getValue("app_customization");
		    var manifest = new ManifestService().getManifestForAppVersion(app_id, version, true, true);
		    gs.info("Manifest for App customization:  {0} customizationVersion {1} is {2}", [app_id, customizationVersion, JSON.stringify(manifest)]);
		}	
    },

    _getOrCreateStoreApp: /*GlideRecord*/ function(/*String*/ appID, /*String*/ version) {
		var storeApp = new GlideRecord("sys_store_app");
		storeApp.query('sys_id', appID);

		if (this._isJumboAppInstall) {
			if (!storeApp.next())
				storeApp = this._convertToStoreAppAndScopedPlugins(appID, version);
			else {
				var scopedPlugin = new GlideRecord('sys_scoped_plugin');
				scopedPlugin.addQuery('source', this._offeringPluginId);
				scopedPlugin.addQuery('version', version);
				scopedPlugin.query();
				if (!scopedPlugin.next())
					storeApp = this._convertToStoreAppAndScopedPlugins(appID, version);
			}
		} else {
			if (!storeApp.next())
				storeApp = this._convertToStoreApp(appID, version);
		}

		if (!gs.isPaused() && storeApp)
			this._setValuesFromVersion(storeApp, version);

		return storeApp;
	},

	_convertToStoreApp: /*GlideRecord sys_store_app*/ function (/*String*/ remoteAppId, /*String*/ version) {
          var remoteApp, storeApp;

		remoteApp = new GlideRecord("sys_remote_app");
		if (!remoteApp.get(remoteAppId))
			throw new Error("Unable to find expected remote app: " + remoteAppId);


		if(remoteApp.getValue("delivery_source") == 'out_of_band' && !gs.isPaused())
			if(sn_lef.GlideEntitlement.isLicenseCheckRequired(remoteApp.getValue("sys_code")))
				if(!sn_lef.GlideEntitlement.hasLicenseForApp(remoteApp.getValue("sys_code"))){
					var msg = gs.getMessage("Aborting installation of application: {0}, application does not have a valid license", [remoteApp.getValue("name")]);
					gs.error(msg);
					this._PARENT_TRACKER.fail(msg);
					throw new Error("license not found for "+remoteApp.getValue("name"));
				}

		// create a new sys_store_app record, using sys_remote_app as a copy
		gs.info("Creating new sys_store_app " + remoteAppId + " from sys_remote_app entry");
		storeApp = new GlideRecord("sys_store_app");
		storeApp.initialize();
		storeApp.setValue("sys_id", remoteAppId);
                storeApp.setValue("licensable", remoteApp.getValue("licensable"));
		storeApp.setNewGuidValue(remoteAppId);
		storeApp.setValue("name", remoteApp.getValue("name"));
		storeApp.setValue("scope", remoteApp.getValue("scope"));
		storeApp.setValue("latest_version", remoteApp.getValue("latest_version"));
		storeApp.setValue("assigned_version", version);
		storeApp.setValue("vendor", remoteApp.getValue("vendor"));
		storeApp.setValue("vendor_prefix", remoteApp.getValue("vendor_prefix"));
		storeApp.setValue("short_description", remoteApp.getValue("short_description"));
		storeApp.setValue("dependencies", remoteApp.getValue("dependencies"));
		storeApp.setValue("compatibilities", remoteApp.getValue("compatibilities"));
        storeApp.setValue("is_store_app", remoteApp.getValue("is_store_app"));
		storeApp.setValue("demo_data", remoteApp.getValue("demo_data"));
		storeApp.setValue("shared_internally", remoteApp.getValue("shared_internally"));
		storeApp.setValue("auto_update", !!remoteApp.auto_update);
		storeApp.setValue("active", false); // when installed it'll become active
		if (storeApp.isValidField("last_installed_from"))
			storeApp.setValue("last_installed_from",remoteApp.getValue("delivery_source"));
		storeApp.setValue("upload_info", remoteApp.getValue("upload_info"));
		storeApp.setValue("products", remoteApp.getValue("products"));

		if (storeApp.isValidField("sn_managed") && remoteApp.isValidField("sn_managed"))
			storeApp.setValue("sn_managed", remoteApp.getValue("sn_managed"));

		/*Get LOB and Price type value for installed version.
		If no value is available, fallback to the values in sys_remote_app table
		*/
		var versionAttributes = this._getVersionAttributes(remoteApp.getValue("source_app_id"), version);

		var versionLob = versionAttributes ? versionAttributes.lob : remoteApp.getValue("lob"),
		    versionPrice = versionAttributes ? versionAttributes.price_type : remoteApp.getValue("price_type"),
		    versionIndicators = versionAttributes ? versionAttributes.indicators : remoteApp.getValue("indicators"),
		    versionDateMessage = versionAttributes ? versionAttributes.display_message : remoteApp.getValue("display_message"),
		    versionNeedsAppEngineLicensing = versionAttributes.needs_app_engine_licensing ? versionAttributes.needs_app_engine_licensing : remoteApp.needs_app_engine_licensing,
		    versionCustomTableCount = versionAttributes.custom_table_count ? versionAttributes.custom_table_count : remoteApp.getValue("custom_table_count");

		storeApp.setValue("lob", versionLob);
		storeApp.setValue("price_type", versionPrice);
		storeApp.setValue("indicators", versionIndicators);
		storeApp.setValue("display_message", versionDateMessage);
		storeApp.setValue("uninstall_blocked", remoteApp.uninstall_blocked);
		storeApp.setValue("hide_on_ui", remoteApp.hide_on_ui.toString() == "true" ? true : false );
		storeApp.setValue("installed_as_dependency", remoteApp.installed_as_dependency.toString() == "true" ? true : false);
		storeApp.setValue("needs_app_engine_licensing", versionNeedsAppEngineLicensing);
		storeApp.setValue("custom_table_count", versionCustomTableCount);
		storeApp.setValue("logo", remoteApp.getValue("logo"));

		storeApp.insert();
		if (!storeApp.isValidRecord())
			throw new Error("Unable to create new sys_store_app record: " + remoteAppId);

		// Reap sys_remote_app, since we now have a store app to install
        this.glideAppLoader.reapOldRemoteApp(remoteApp, storeApp);

		return storeApp;
	},

	_convertToStoreAppAndScopedPlugins: /*GlideRecord sys_scoped_plugin*/ function (/*String*/ appID, /*String*/ version) {
		return sn_jumbo_app.JumboAppAPI.convertToStoreAppAndScopedPlugins(appID, this._offeringPluginId, version);
	},

	_getVersionAttributes: /*Object*/ function (sourceAppId, version) {
		var appVersion = new GlideRecord("sys_app_version");
		appVersion.addQuery("version", version);
		appVersion.addQuery("source_app_id", sourceAppId);
		appVersion.query();

		if(appVersion.next()) {
			return {	"lob": appVersion.getValue("lob"),
					"price_type": appVersion.getValue("price_type"),
					"indicators": appVersion.getValue("indicators"),
					"display_message": appVersion.getValue("display_message"),
					"needs_app_engine_licensing": appVersion.needs_app_engine_licensing,
					"custom_table_count": appVersion.getValue("custom_table_count")
					};
		} else
			return "";
	},

	_shouldInstallOrUpgrade: /*boolean*/ function(/*GlideRecord*/ app, /*String*/ version) {
		var msg;
		if(!gs.isPaused() && !this._userHasInstallAccess(app)) {
			msg = gs.getMessage("Insufficient privileges for user: {0} to install or update an application package {1}", [gs.getUserID(), app.sys_id]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		if (!app.isValidRecord()) {
			msg = gs.getMessage(this.APP_IS_NOT_AVAILABLE, app.sys_id);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		var assignedVersion = this._cleanVersion(version);
		if (gs.nil(assignedVersion)) {
			msg = gs.getMessage(this.NO_ASSIGNED_VERSION,  app.sys_id);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		var installedVersion = this._cleanVersion(app.version);
		/** installed = from/current, assigned = to/target */
		if (!gs.nil(installedVersion) && this._isDowngrade(installedVersion, assignedVersion)) {
			msg = gs.getMessage(this.CANT_DOWNGRADE, [ app.sys_id, installedVersion, assignedVersion]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		return true;
	},

	_shouldInstallOrUpgradeCustomization: /*boolean*/  function(/*GlideRecord*/ app, /*String*/ version, /*boolean */ isReinstall) {
		var installedVersion = this._cleanVersion(app.version);
		var assignedVersion = this._cleanVersion(version);
		if (assignedVersion == installedVersion && !gs.isPaused() && !isReinstall) {
			msg = gs.getMessage(this.NO_UPGRADE_NECESSARY, [assignedVersion, app.sys_id]);
			gs.info(msg);
			return false;
		}
		return true;
	},

	_shouldInstallOrUpgradeStoreApp: /*boolean*/ function(/*GlideRecord*/ app, /*String*/ version, /*boolean */ isReinstall) {
		var installedVersion = this._cleanVersion(app.version);
		var assignedVersion = this._cleanVersion(version);
		if (assignedVersion == installedVersion && app.active && !gs.isPaused() && !isReinstall && !this._requiredToInstallOffering()) {
			msg = gs.getMessage(this.NO_UPGRADE_NECESSARY, [assignedVersion, app.name]);
			gs.info(msg);
			return false;
		}
		return true;
	},

    _checkStoreAppDependencies: /*boolean*/ function(/*GlideRecord*/ app, /*String*/ version) {
        if (this._isJumboAppInstall) {
			var response = sn_jumbo_app.JumboAppAPI.checkCompatibility(this._offeringPluginId, this._optionalDependencies);
			this._unavailableDepPlugins = response.unavailableDepPlugins || '';
			this._inaccessibleDepApps = response.inaccessibleDepApps || '';
			this._depAppsBlockedForInstall = response.depAppsBlockedForInstall || '';
        } else
			this._checkCompatibility(app, version);

		if (this._unavailableDepPlugins != "") {
			msg = gs.getMessage(this.PLUGIN_DEPENDENCY_UNAVAILABLE, [app.name, this._unavailableDepPlugins]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		if (this._inaccessibleDepApps != "") {
			msg = gs.getMessage(this.APP_DEPENDENCY_UNAVAILABLE, [app.name, this._inaccessibleDepApps]);
			gs.error(msg);
			this.forceSyncWithStore({appId: app.sys_id, appVersion: version, callerPath: "checkStoreAppDependencies:inaccessible_deps"});
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		if(this._depAppsBlockedForInstall != ""){
			msg = gs.getMessage("Aborting installation of application: {0}, application depends on other applications which are blocked for install: {1}", [app.name, this._depAppsBlockedForInstall]);
			gs.error(msg);
			this.forceSyncWithStore({appId: app.sys_id, appVersion: version, callerPath: "checkStoreAppDependencies:blocked_deps"});
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		return true;
	},

	_userHasInstallAccess : function(/*GlideRecord sys_store_app*/ storeApp) {
		if (GlidePluginManager.isActive("com.glide.app_api")) {
			if (typeof sn_app_api.AppStoreAPI.canInstallOrUpgrade != "undefined")
				return sn_app_api.AppStoreAPI.canInstallOrUpgrade(storeApp);
		}

		// admin or app_client_user is allowed to install or upgrade
		if (gs.hasRole('sn_appclient.app_client_user'))
			return true;

		return false;
	},

	_userHasCustomizationInstallAccess : function(/*GlideRecord sys_app_customization*/ customization) {
		if (GlidePluginManager.isActive("com.glide.app_api")) {
			if (typeof sn_app_api.AppStoreAPI.canInstallOrUpgrade != "undefined")
				return sn_app_api.AppStoreAPI.canInstallOrUpgrade(customization);
		}

		// admin or app_client_user is allowed to install or upgrade
		if (gs.hasRole('sn_appclient.app_client_user'))
			return true;

		return false;
	},
	
	_setValuesFromVersion : function(/*GlideRecord sys_store_app*/ storeApp, /*String*/ version) {
		var updateAvailable = false;
		var customizationExistForApp = false;
		var customizationVersion = this.customizationVersion;
		var customizationGR = new GlideRecord("sys_app_customization");
		customizationGR.addQuery("vendor_app", storeApp.getValue("sys_id"));
		customizationGR.query();
		if(customizationGR.next()){
			customizationExistForApp = true;
			if(gs.nil(customizationVersion) || !customizationVersion || customizationVersion == 'none' || customizationVersion == "undefined"){
				customizationVersion = "0.0.0";
			}
			if(this._isDowngrade(customizationGR.getValue("latest_version"), customizationVersion))
				updateAvailable =  true;
		}
		
		if(!updateAvailable && this._isDowngrade(storeApp.getValue("latest_version"), version))
			updateAvailable = true;
		storeApp.setValue("customization", (customizationExistForApp ? customizationGR.getValue("sys_id"): null));
		storeApp.setValue("update_available", updateAvailable);
		storeApp.update();
		
		var versionGr = new GlideRecord('sys_app_version');
		versionGr.addQuery("source_app_id", storeApp.getValue("sys_id"));
		versionGr.addQuery("version", version);
		versionGr.query();

		if (versionGr.getRowCount() == 1 && versionGr.next()) {
			//update dependencies, short_description etc
			storeApp.setValue("assigned_build_version", versionGr.getValue("build_version"));
			storeApp.setValue("auto_update", versionGr.getValue("auto_update"));
			storeApp.setValue("demo_data", versionGr.getValue("demo_data"));
			storeApp.setValue("dependencies", versionGr.getValue("dependencies"));
            storeApp.setValue("compatibilities", versionGr.getValue("compatibilities"));
            storeApp.setValue("is_store_app", versionGr.getValue("is_store_app"));
			storeApp.setValue("name", versionGr.getValue("name"));
			storeApp.setValue("short_description", versionGr.getValue("short_description"));
			storeApp.setValue("last_installed_from", versionGr.getValue("delivery_source"));
			storeApp.setValue("upload_info", versionGr.getValue("upload_info"));
			storeApp.setValue("uninstall_blocked", versionGr.uninstall_blocked);
			storeApp.setValue("hide_on_ui", versionGr.hide_on_ui.toString() == "true" ? true : false);
			storeApp.setValue("installed_as_dependency", versionGr.installed_as_dependency.toString() == "true" ? true : false);
			storeApp.setValue("needs_app_engine_licensing", versionGr.needs_app_engine_licensing);
			storeApp.setValue("custom_table_count", versionGr.custom_table_count);

			this._setValuesFromManifest(storeApp, version);

		}

	},

	_setValuesFromManifest: function(/*GlideRecord sys_store_app */ storeApp, /*string*/ version) {
		var manifestService = new ManifestService();
		var manifest = manifestService.getManifestForAppVersion(storeApp.getValue("sys_id"), version, false, true);
		var mapRepo, map, source, target, i;
		var licenseModel, licenseDefinition;

		if (manifest && manifest.hasOwnProperty("additional_fields")) {
			mapRepo = new ManifestFieldMap(manifest);
			for (i = 0; i< manifest.additional_fields.length; i++) {
				source = manifest.additional_fields[i];
				map = mapRepo.getMap(source.field_name);
				target = map(source);

				gs.debug("Setting field {0} to {1}, from manifest", target.field_name, target.value);
				if (storeApp.isValidField(target.field_name)) {
					if (target.field_name == "license_model") {
						licenseModel = target.value;
						storeApp.setValue(target.field_name, target.value);
					} else if (target.field_name == "license_definition")
						licenseDefinition = target.value;
					else
						storeApp.setValue(target.field_name, target.value);
				}
			}

			if (gs.nil(licenseDefinition) ||
				!(sn_app_api.AppStoreAPI.isISVScope(storeApp.scope)) ||
				licenseModel != "capacity") {
				storeApp.setValue("license_definition", "");
			}
			else
				storeApp.setValue("license_definition", licenseDefinition);
		}
	},

	_cleanVersion: /*String*/ function(/*String*/ version) {
		if (gs.nil(version))
			return '';

		return (version+'').trim();
	},

	/**
	 * Analyzes dependencies for the installing app.
	 * Produces this._unavailableDepPlugins, this._inaccessibleDepApps, this._depAppsBlockedForInstall CSV lists as result of its execution.
	 */
	_checkCompatibility: /*void*/ function(/*sys_store_app*/ storeApp, /*String*/ version) {
		this._unavailableDepPlugins = ""; // comma-separated list of dependency plugins which are unavailable at this instance
		this._inaccessibleDepApps = ""; // comman-seprated list of dependency apps which are unavailable at app store
		this._depAppsBlockedForInstall = "";
		var dependencies = storeApp.dependencies + "";
		gs.info("_checkCompatibility: dependencies = " + dependencies);
		if (gs.nil(dependencies))
			return;

    // For servicenow Apps we want to auto resolve optional plugin dependency.
    var isServiceNowApp = storeApp.scope.indexOf("sn_") == 0;

		var depArray = dependencies.split(",");
		var dependencyApps = "";
		for (var i = 0; i < depArray.length; i++) {
			var depPair = depArray[i].split(":"); // pair of dependency id and version
			if (depPair.length > 0 && gs.nil(depPair[0]))
				continue;

			if (depPair.length < 2 || depPair[1] == "sys") { // handle plugin dependencies
				var name = depPair[0];
				if (name.startsWith("apps/") || name.startsWith("glidesoft"))
					continue;

				gs.info("_checkCompatibility: dependency = " + depPair[0]);
				var isPluginActive = GlidePluginManager.isActive(depPair[0]);
				if (!isPluginActive && !isServiceNowApp) {
					if (this._unavailableDepPlugins != "")
					 	this._unavailableDepPlugins += ",";
					 this._unavailableDepPlugins += depPair[0];
				}
			} else {
				if (this._appAlreadyExist(depPair))
					continue;

				if (dependencyApps != "")
					 dependencyApps += ",";

				dependencyApps += depArray[i];
			}
		}

		gs.info("_checkCompatibility: this._unavailableDepPlugins = " + this._unavailableDepPlugins);
		gs.info("_checkCompatibility: dependencyApps = " + dependencyApps);
		// now validate app dependencies at app store only if app is installed from UI which is not offline app and not during zboot or upgrade
		if (dependencyApps != "" && !gs.isPaused()) {
			var dependencyProcessorObj = new DependencyProcessor(storeApp.scope);
			var dependentAppsStatus = dependencyProcessorObj.processDependency(dependencyApps.split(','));
			dependentAppsStatus.forEach(function(dependentApp) {
				if(!dependentApp.active) {
				    if(dependentApp.status == dependencyProcessorObj.knownStatusMap["Installation blocked"]) {
                        this._depAppsBlockedForInstall += (this._depAppsBlockedForInstall == "") ? dependentApp.Id : "," + dependentApp.Id;
                    }else{
                        this._inaccessibleDepApps += (this._inaccessibleDepApps == "") ? (dependentApp.Id + ":" + dependentApp.minVersion) : ("," + dependentApp.Id + ":" + dependentApp.minVersion);
                    }
                }
			},this);
		}
		gs.info("_checkCompatibility: this._inaccessibleDepApps = " + this._inaccessibleDepApps);
	},

	_installCustomizationPackage: /*boolean*/ function(/*sys_app_customization*/ customization,  /*sys_store_app*/ storeApp, /*Boolean*/ loadDemoData, /*Boolean*/ obtainMutex, /*Boolean*/ isInteractiveInstall) {
		gs.info("Installing or upgrading customizations for: " + customization.vendor_app.name);

		if (this._isStoreAppInstall && !gs.nil(storeApp)) {
		        if (isInteractiveInstall)
		            return this.glideAppLoader.installOrUpgradeAppCustomizationAndStoreAppInteractive(customization, storeApp, obtainMutex, loadDemoData, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies);
                else
		            return this.glideAppLoader.installOrUpgradeAppCustomizationAndStoreApp(customization, storeApp, obtainMutex, loadDemoData, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies);
        }

        if (isInteractiveInstall)
            return this.glideAppLoader.installOrUpgradeAppCustomizationInteractive(customization, obtainMutex, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies);
        else
		    return this.glideAppLoader.installOrUpgradeAppCustomization(customization, obtainMutex, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies);
	},


	_installApplicationPackage: /*boolean*/ function(/*sys_store_app*/ storeApp, /*Boolean*/ loadDemoData, /*Boolean*/ obtainMutex, /*Boolean*/ isReinstallRequested, /*Boolean*/ isInteractiveInstall) {
		gs.info("Installing or upgrading application: " + storeApp.name + ", loadDemoData: " + loadDemoData);
		gs.info("Install is interactive session " + gs.isInteractive());
		if (obtainMutex == true) {
			if (typeof this.glideAppLoader.installOrUpgradeAppWithMutex != "undefined")
			    if (isInteractiveInstall)
			        return this.glideAppLoader.installOrUpgradeAppWithMutexInteractive(storeApp.getUniqueValue(), loadDemoData, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies, isReinstallRequested);
		        else
			        return this.glideAppLoader.installOrUpgradeAppWithMutex(storeApp.getUniqueValue(), loadDemoData, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies, isReinstallRequested);
		}

		return this.glideAppLoader.installOrUpgradeApp(storeApp.getUniqueValue(), /* deprecated */ "", loadDemoData, this._isJumboAppInstall, this._offeringPluginId, this._optionalDependencies, isReinstallRequested);
	},

	_isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		return this.versionComparator.isDowngrade(currentVersion, targetVersion);
	},

	_isAppCompatible: function(appId, version) {
		var appVersions = new GlideRecord("sys_app_version");
		appVersions.addQuery("source_app_id", appId);
		appVersions.addQuery("version", version);
		appVersions.addQuery("block_install", false);
		appVersions.query();

		return appVersions.getRowCount();
	},

	_getAutoUpdates: /*[{source_app_id,latest_version},...]*/ function() {
		var updates = [];

		if (!this._autoUpdateEnabled) {
			gs.info('Skipping app auto-updates (behavior was disabled via property override)');
			return updates;
		}

		var storeApp = new GlideRecord('sys_store_app');
		if (!storeApp.isValidField('auto_update')) {
			gs.info('Skipping app auto-updates (field sys_store_app.auto_update not found)');
			return updates;
		}

		storeApp.addQuery('auto_update', true);
		storeApp.addNotNullQuery('version');
		storeApp.addNotNullQuery('latest_version');
		storeApp.query();
		gs.info('Got ({0}) candidate records to check for auto-update on', storeApp.getRowCount());
		while (storeApp.next()) {
			var installedVersion = this._cleanVersion(storeApp.getValue('version'));
			var latestVersion = this._cleanVersion(storeApp.getValue('latest_version'));
			if (gs.nil(latestVersion) || latestVersion == installedVersion)
				continue;

			var assignedVersion = this._cleanVersion(storeApp.getValue('assigned_version'));
			if (latestVersion == assignedVersion)
				continue; // upgrade in progress

			var source_app_id = storeApp.getUniqueValue();
			var scope = storeApp.scope.toString();
			if(!this._isAppCompatible(source_app_id, latestVersion))
				continue;

			gs.info('Auto-update store app {0} ({1}) from {2} to {3}',
				scope, source_app_id, installedVersion, latestVersion);

			var update = { source_app_id: source_app_id, scope: scope, latest_version: latestVersion };
			updates.push(update);
		}
		if (storeApp.getRowCount() > 0)
			gs.info('({0}) apps to auto-update', updates.length);

		return updates;
	},

	_removeAppVersions : function(/*string*/ source_app_id, version) {
		//we either installed for the first time, or updated an existing app
		var appVersions = new GlideRecord("sys_app_version");
		appVersions.addQuery("source_app_id", source_app_id);
		appVersions.query();

		while (appVersions.next()) {
			gs.info("Comparing {0} to {1}, is {1} an upgrade? {2}", version, appVersions.getValue("version"), this.versionComparator.isUpgrade(version, appVersions.getValue("version")));
			if (!this.versionComparator.isUpgrade(version, appVersions.getValue("version")))
				appVersions.deleteRecord();
			else {
				appVersions.setValue("remote_app", "");
				appVersions.setValue("store_app", source_app_id);
				appVersions.update();
			}
		}
		var installedComponents = [];
		var installedJumbos = new GlideRecord("sys_scoped_plugin");
		installedJumbos.addActiveQuery();
		installedJumbos.query();
		while (installedJumbos.next()) {
		    installedComponents.push({
		        id: installedJumbos.getValue("source"),
		        version: installedJumbos.getValue("version")
		    });

		}
		gs.info("AppUpgrader._removeAppVersions(): installedComponents: {0}", JSON.stringify(installedComponents));
		//delete installed Jumbo components version from remote scoped plugin
		installedComponents.forEach(function(component) {
		    gs.info("AppUpgrader._removeAppVersions(): removing jumbo plugin: {0}", JSON.stringify(component));
		    if (component.version != null) {
		        appVersions = new GlideRecord("sys_remote_scoped_plugin");
		        appVersions.addQuery("source", component.id);
		        appVersions.addQuery("version", component.version);
		        appVersions.query();
		        while (appVersions.next())
		            appVersions.deleteRecord();
		    }
		});
	},

	_appAlreadyExist: /*boolean*/ function(/*[]*/ depPair) {

		// dependency format of scope:version:id, and this might be a global app
		if (depPair.length < 3)
			return false;

		var wantVersion = depPair[1];
		var appId = depPair[2];
		var haveVersion;

		var availablePackage = new GlideRecord("sys_package");
		availablePackage.addQuery("source", appId);
		availablePackage.query();
		if (!availablePackage.next())
			return false;

		haveVersion = availablePackage.getValue("version");
		var comparator = new VersionComparator();

		//we can allow it if the current version is equal or greater than want version
		return !comparator.isUpgrade(haveVersion, wantVersion);
	},

	_failTrackerIfNeeded: function (tracker, message) {
		gs.error(message);
		var execTracker = new GlideRecord("sys_execution_tracker");
		execTracker.get(tracker.getSysID());
		if (!execTracker.isValidRecord())
			return false;

		// The tracker was already failed
		if (execTracker.state == 3)
			return false;

		tracker.fail(message);
		return true;
	},
	getLatestUpgradeHistory: function (appId) {

		var gr = new GlideRecord('sys_upgrade_history');
		gr.addQuery('to_version',appId);
		gr.orderByDesc('sys_created_on');
		gr.setLimit(1);
		gr.query();

		if(gr.next())
			return gr.getValue('sys_id');
		return "";
	},
	getLatestUpgradeHistoryList: function(plugins) {
		var gr = new GlideRecord('sys_upgrade_history');
		gr.addQuery('to_version', 'IN', plugins);
		gr.orderByDesc('sys_created_on');
		gr.query();
		var upgradeHistoryIds = [];
		while (gr.next())
			upgradeHistoryIds.push(gr.getValue('sys_id'));
		return upgradeHistoryIds;
	},
	getLoggedInUserEmail : function(){
		var user = new GlideRecord("sys_user");
		user.get(gs.getUserID());
		return user.getValue("email");
	},
	updateInstallationInfoOnLatestInstalledApps : function(additionalArgs){
		var storeGr = this.getActiveStoreAppsInInstallationWindow();
		while(storeGr.next()) {
			if (!gs.nil(additionalArgs) && storeGr.isValidField("installation_info")) {
					storeGr.installation_info = JSON.stringify(additionalArgs);
					storeGr.setWorkflow(false);
					storeGr.update();
			}
		}
	},
	getActiveStoreAppsInInstallationWindow : function (){
		var installationEndTime = new GlideDateTime().getValue();
		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addQuery("update_date",">=",this.installationStartTime);
		storeAppGr.addQuery("update_date","<=",installationEndTime);
		storeAppGr.addActiveQuery();
		storeAppGr.query();
		return storeAppGr;
	},
	
	getBatchAppsToBeUpdatedInCache: function(batchInstallPlan) {
		var specificAppsToUpdate = [];
		var sharedInternally = false;
		batchInstallPlan.packages.forEach(function(app) {
			specificAppsToUpdate.push({
				sourceAppId: app.id,
				sysCode: app.id
			});
		});

		var args = {
			specificAppsToUpdate: specificAppsToUpdate,
			sharedInternally: sharedInternally
		};

		return args;
	},
	
	installBatch : function(batchInstallPlan , isScheduled){
		this.installationStartTime = new GlideDateTime().getValue();
		var installedBatch = this.glideAppLoader.installBatch(batchInstallPlan, isScheduled);
		
		if(gs.getProperty("sn_appclient.enable_app_manager_cache", "true") == "true") {
			var args = this.getBatchAppsToBeUpdatedInCache(JSON.parse(batchInstallPlan));
			this.updateAppsPluginsCache(args);
		}

		return installedBatch;
	},

    installProductByPlan: function(installationPlan) {
        var installationResponse = {};
        var batchInfo;
        try {
            gs.info("installPayload" + JSON.stringify(installationPlan));
            if (installationPlan) {
                if (installationPlan && installationPlan.hasOwnProperty('name') && installationPlan.hasOwnProperty('packages') && installationPlan.packages.length > 0) {
                    new AppClientGCFUtil().recordBatchInstallAnalytics(installationPlan);
                    batchInfo = this.installBatch(JSON.stringify(installationPlan), false);
                    if (batchInfo != null)
                        installationResponse.batchInfo = JSON.parse(batchInfo);
                    else
                        installationResponse.error = "failed to install product";
                } else {
                    installationResponse.error = "invalid product payload";
                }
            }
        } catch (e) {
            installationResponse.error = "failed to process product Install" + e;
        }
        return installationResponse;
    },

    installAndUpdateApps: function(params) {
        var appID = params.app_id;
        var version = params.version;
        var customizationVersion = params.customization_version;
        var loadDemoData = params.load_demo_data;
        var isReinstall = params.isReinstall;
        var subscription = params.subscription;
        var isInteractiveInstall = params.isInteractiveInstall;

        this.recordAppInstallEvent(params);

        gs.info("Download app: {0}, version: {1}, loadDemoData: {2}, isReinstall: {3}, customizationVersion: {4}, subscription: {5}", appID, version, loadDemoData, isReinstall, customizationVersion, subscription);

        var progress_name = "Install Application";
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(progress_name);
        worker.setBackground(true);
        worker.setCannotCancel(true);
        worker.setScriptIncludeName("sn_appclient.AppUpgrader");
        worker.setScriptIncludeMethod("upgradeProcess");
        worker.putMethodArg("appID", appID);
        worker.putMethodArg("version", version);
        worker.putMethodArg("loadDemoData", loadDemoData);
        worker.putMethodArg("obtainMutex", true);
        worker.putMethodArg("isReinstallRequested", isReinstall == "true");

        worker.putMethodArg("additionalArgs", {
            "installed_user": {
                "user_id": gs.getUserName(),
                "user_email": this.getLoggedInUserEmail()
            }
        });

        if (customizationVersion)
            worker.putMethodArg("customizationVersion", customizationVersion);
        else // Explicitly define so that the parameters are spaced property
            worker.putMethodArg("customizationVersion", undefined);

        worker.putMethodArg("subscription", subscription);

        worker.putMethodArg("jumboAppArgs", undefined);
        worker.putMethodArg("isInteractiveInstall", isInteractiveInstall == "true");

        worker.start();

        var trackerId = worker.getProgressID();
        var jsonResponse = {};
        jsonResponse.trackerId = trackerId;

        return jsonResponse;
    },

    recordAppInstallEvent: function(params) {
        var collectionData = {};
        collectionData.app_id = params.app_id;
        collectionData.installation_type = "Standalone Install";
        collectionData.has_customization = params.customization_version ? true : false;
        collectionData.is_repair = params.isReinstall == "true" ? true : false;
        collectionData.is_search_applied = params.is_search_applied;
        collectionData.is_filter_applied = params.is_filter_applied;
        collectionData.entity_type = params.shared_internally == "true" ? "Company Application" : "Store Application";
        new AppClientGCFUtil().recordEvent("install", "app_install", collectionData);
    },

    _parseJumboAppArgs: /*boolean*/ function(/*String*/ jumboAppArgs, /*String*/ appID) {
		if (!gs.nil(jumboAppArgs)) {
			this._offeringPluginId = appID;
			try {
				var jumboAppArgsObj = JSON.parse(jumboAppArgs);
				this._isJumboAppInstall = jumboAppArgsObj.isJumboAppInstall || false;
				this._offeringPluginId = jumboAppArgsObj.offering || '';
				this._optionalDependencies = jumboAppArgsObj.optional_dependencies || [];
			} catch (error) {
				gs.error('Invalid AppV2 parameters provided for ' + appID + '. jumboAppArgs=' + jumboAppArgs);
				this._PARENT_TRACKER.fail(sn_i18n.Message.getMessage("AppUpgrader", "Invalid JumboApp parameters provided for {appId}", {appId: appID}));
				return false;
			}
		}

		return true;
	},

    _requiredToInstallOffering: /*boolean*/ function() {
		if (!this._isJumboAppInstall)
			return false;

		if (!this._offeringPluginId)
			return false;

		var scopedPlugin = new GlideRecord('sys_scoped_plugin');
		scopedPlugin.query('source', this._offeringPluginId);
		if (GlidePluginManager.isActive(this._offeringPluginId) && !this._optionalDependencies.length)
				return false;

		return true;
    },

    _updateStoreAppRecords: function(/*GlideRecord*/ app, /*String*/ appVersion, /*String*/ subscription, /*String*/ additionalArgs) {
		app.assigned_version = appVersion;
		if (!gs.nil(additionalArgs) && app.isValidField('installation_info'))
			app.installation_info = JSON.stringify(additionalArgs);

		var licenseColumn = CommonUtils.getLicenseColumn();
		if (subscription && app.isValidField(licenseColumn)) // Only set subscription if one was provided
			app.setValue(licenseColumn, subscription);

		app.update();
    },

    type: 'AppUpgrader'
};
