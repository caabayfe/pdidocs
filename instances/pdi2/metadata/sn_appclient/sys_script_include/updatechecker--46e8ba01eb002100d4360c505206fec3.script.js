var UpdateChecker = Class.create();
UpdateChecker.prototype = {
    initialize: function(scheduledInstallerPayload) {
		this._quiet = gs.getProperty("sn_appclient.http_check_updates_quietly", "true") == "true";
		this.json = new global.JSON();
		this.versionComparator = new VersionComparator();
		this.glideAppLoader = new GlideAppLoader();
		this.appNotificationConfig = this._getAppNotificationConfig();
		this.totalAppNotificationCount = 0;
		this.ENTITLEMENT_REVOKED = "entitlement_revoked";
		this.TRIAL_DEACTIVATION_REQUESTED = "trial_deactivation_requested";
		this.NOTIFICATION_GROUP_NAME = "StoreAppNotifications";
		this.VERSION_TYPE = {
			INSTALLED: "installed",
			MOST_RECENT: "most_recent"
		};
		this.downloadLogoList = [];
		this.constants = {
			"NO_LOGO_EXIST": "no_logo_exist"
		};
		this.canSendNotification = gs.getProperty("com.snc.unified_plugin.connect.notification.enabled", "false") == "true";
		this.processDeltaAppsOnly = gs.getProperty("sn_appclient.process.delta.apps.only", "true") == "true";
		this.isInstanceOffline = gs.getProperty("sn_appclient.app.install.offline", "false") == "true";
		this.appManagerCacheEnabled = gs.getProperty("sn_appclient.enable_app_manager_cache", "false") == "true";
		this.spaceRegex = /\s/g;
		this.buildName = new GlideUpgradeUtil().getCurrentBuildName().replace(this.spaceRegex, "").toLowerCase();
		this.notCertifiedAppBlockMessage = gs.getMessage('App not compatible with your instance.');
		this.notCertifiedAppIndicator =  [{"id":"incompatible", "message": gs.getMessage("Not certified"), "order": 1, "show_as_filter": true, "tooltip": gs.getMessage("App is not yet certified for this platform release."), "type": "error"}];
		this.checkAppEntitlements = scheduledInstallerPayload;
		this.specificAppsToUpdate = "[]";
		this.appsUpdatedInDB = {};
		this.jumboCatalog = []; // format of this.jumboCatalog = [{source_app_id: "", plugin_id: "", versions: ['1.0.0', '2.0.0']}];
		this.appChecksumsCacheEnabled = gs.getProperty("sn_appclient.enable_app_manager_checksums_cache", "true") == "true";
		this._digest = new GlideDigest();
    },

	_setAppsSyncProgress: function(progress, description) {
		var thisSetAppsSyncProgressTime = new Date().getTime();
		if (this._lastSetAppsSyncProgressTime) {
			gs.info('[Progress] Last Duration: ' + (thisSetAppsSyncProgressTime - this._lastSetAppsSyncProgressTime));
		}
		this._lastSetAppsSyncProgressTime = thisSetAppsSyncProgressTime;
		CommonUtils.setSystemProperty("sn_appclient.apps_sync_progress", "value", progress*100);
		gs.info('[Progress] ' + description);
	},

	_getAppNotificationConfig: function() {
		return {
			"appAvailableForInstall": {
				"count": 0,
				"filter":[
				{
					"category": gs.getMessage("License Status"),
					"id": "sub"
				},
				{
					"category": gs.getMessage("Obtained"),
					"id": "not_installed"
				},
				{
					"category": gs.getMessage("Listing type"),
					"id": "show_apps_only"
				}],
				"linkText": gs.getMessage("Apps available for install")
			},
			"appAvailableForUpdate": {
				"count": 0,
				"filter":[
				{
					"category": gs.getMessage("Obtained"),
					"id": "updates"
				},
				{
					"category": gs.getMessage("Listing type"),
					"id": "show_apps_only"
				}],
				"linkText": gs.getMessage("App Updates")
			},
			"appDeactivationRequests": {
				"count": 0,
				"filter":[
				{
					"category": gs.getMessage("Indicators"),
					"id": "trial_deactivation_requested"
				},
				{
					"category": gs.getMessage("Listing type"),
					"id": "show_apps_only"
				}],
				"linkText": gs.getMessage("App deactivation requests")
			},
			"appEntitlementRevoked": {
				"count": 0,
				"filter":[
				{
					"category": gs.getMessage("Indicators"),
					"id": "entitlement_revoked"
				},
				{
					"category": gs.getMessage("Listing type"),
					"id": "show_apps_only"
				}],
				"linkText": gs.getMessage("Apps with entitlement revoked")
			},
		};
	},

	// Persist checksums once per sync
	_saveAppChecksumsMap: function() {
		if (!this.appChecksumsCacheEnabled) return;
		try {
			if (Object.keys(this.appChecksums).length == 0) return;
			new global.AppManagerCache().putResponseInCache("appChecksums", this.appChecksums, false);
		} catch (e) {
			gs.error(e);
		}
	},

	// Remove deleted apps from the checksums map
	_removeAppFromChecksumsMap: function(sourceAppId) {
		if (!this.appChecksumsCacheEnabled) return;
		try {
			delete this.appChecksums[sourceAppId];
		} catch (e) {}
	},

	// Recursively reduce an object to a deterministic (sorted) string
	_deterministicSerialize: function(obj) {
		try {
			if (Array.isArray(obj)) {
				return obj.map(item => this._deterministicSerialize(item) + ',');
			} else if (typeof obj === 'object') {
				return Object.keys(obj).sort().map(key => {
					return key + ':' + this._deterministicSerialize(obj[key]) + ',';
				});
			}
		} catch (e) {}
		return JSON.stringify(obj);
	},

	// Strip unchanged apps from the Store payload and update app-level checksum map.
	_filterUnchangedAppsByChecksum: function(storePayload) {
		if (!this.appChecksumsCacheEnabled) return;

		try {
			var cachedChecksums = new global.AppManagerCache().getResponseFromCache("appChecksums", false);
			if (Object.keys(cachedChecksums).length == 0) throw new Error("Cache empty or invalid.");
			this.appChecksums = cachedChecksums;
		} catch (e) {
			gs.info("appChecksumsCache was not retrieved.");
			this.appChecksums = {};
		}

		var appsFilteredByChecksum = {};
		for (var appIndex = storePayload.length - 1; appIndex >= 0; --appIndex) {
			var currentApp = storePayload[appIndex];
			var sourceAppId = currentApp.source_app_id;
			var currentChecksum = this._digest.md5_digest(this._deterministicSerialize(currentApp));
			if (!currentChecksum) continue;

			if (this.appChecksums[sourceAppId] === currentChecksum) {
				appsFilteredByChecksum[sourceAppId] = true;
				storePayload.splice(appIndex, 1);
			} else {
				this.appChecksums[sourceAppId] = currentChecksum;
			}
		}
		this.appsFilteredByChecksum = Object.keys(appsFilteredByChecksum).join(',');
	},

	updateClientCallsPropertyFromAppRepo: function() {
		try {
			var gu = new GlideUpgradeUtil();
			var parms = {
				glide_build: gu.getCurrentBuild(),
				glide_build_name: gu.getCurrentBuildName(),
				applications: this._getInstalledApplicationsJSON()
			};
			var checkClientCallsResponse = new ScopedAppRepoRequest("client_calls_allowed")
				.setParameter("glide_build", parms.glide_build)
				.setParameter("glide_build_name", parms.glide_build_name)
				.setParameter("applications", parms.applications)
				.setQuiet(this._quiet)
				.post();
			var checkClientCalls = this.json.decode(checkClientCallsResponse);
			if (gs.nil(checkClientCalls) || gs.nil(checkClientCalls.client_calls_allowed))
				return;

			gs.debug("Got ({0}) client calls allowed: {1}", checkClientCalls.client_calls_allowed, this.json.encode(checkClientCalls));

			var currentPropertyValue = gs.getProperty("sn_appclient.client_calls_allowed", "true");
			var newPropertyValue = checkClientCalls.client_calls_allowed == "true";
			if (currentPropertyValue != newPropertyValue) {
				gs.debug("changing property value sn_appclient.client_calls_allowed from ({0}) to ({1})", currentPropertyValue, newPropertyValue);
				var props = {
					"sn_appclient.client_calls_allowed": newPropertyValue + ''
				};
				new GlideAppLoader().setAuthorProperties(props);
			}
		} catch (e) {
			gs.error("Unable to parse response from App Repo. The server may not be active >> {0}", checkClientCallsResponse);
		}
	},

	_fixUpdateAvailableField: function() {
	    gs.info("UpdateChecker._fixUpdateAvailableField");
	    var versionComparator = new sn_appclient.VersionComparator();
	    var storeApp = new GlideRecord('sys_store_app');
	    storeApp.addActiveQuery();
	    storeApp.addEncodedQuery("last_installed_fromINstore,out_of_band,offline");
	    storeApp.query();
	    while (storeApp.next()) {
	        if (versionComparator.isUpgrade(storeApp.getValue('version'), storeApp.getValue('latest_version'))) {
	            gs.info('"glidefix:Update available on app name :' + storeApp.getValue('name') + ', version: ' + storeApp.getValue('version') + ', Latest version: ' + storeApp.getValue('latest_version'));
	            storeApp.setValue('update_available', true);
	            storeApp.update();
	        } else {
	            storeApp.setValue('update_available', false);
	            storeApp.update();
	        }
	    }
	},

	/**
	 * Check central app repo for available updates
	 * Refreshes the local data model and UI to reflect any changes
	 */
	checkAvailableUpdates:/*void*/ function(isInteractive, honourChecksum, args, skipUpdateMutexCheck) {
		gs.info("appNotificationConfig: " + JSON.stringify(this.appNotificationConfig));
		gs.info("checkAvailableUpdates({0}, {1}, {2})", [isInteractive, honourChecksum, skipUpdateMutexCheck]);

		this._setAppsSyncProgress(0.01, 'fixUpdateAvailableField');

		this._fixUpdateAvailableField();

		this._setAppsSyncProgress(0.02, 'specificAppsToUpdate');

		if(!gs.nil(args) && !gs.nil(args.specificAppsToUpdate))
			this.specificAppsToUpdate = JSON.stringify(args.specificAppsToUpdate);

		if(gs.nil(args))
			args = {};

		if(args.hasOwnProperty('appManagerCacheEnabled')) {
			this.appManagerCacheEnabled = args.appManagerCacheEnabled;
		}

		if (this.isInstanceOffline) {
			this.appChecksumsCacheEnabled = false;
		} else if (args.hasOwnProperty('appManagerChecksumsCacheEnabled')) {
			this.appManagerCacheEnabled = args.appManagerChecksumsCacheEnabled;
		} else {
			this.appChecksumsCacheEnabled = gs.getProperty("sn_appclient.enable_app_manager_checksums_cache", "true") == "true";
		}

		this._setAppsSyncProgress(0.03, 'fetchAppUpdates');

		var sharedInternally = !!args.sharedInternally;
		if (sharedInternally) {
			this.appChecksumsCacheEnabled = false;
		}

		var storePayload = this._fetchAppUpdates(isInteractive, honourChecksum, args, !skipUpdateMutexCheck);
		if (!storePayload || storePayload.length <= 0) {
			this._setAppsSyncProgress(0.00, 'finished');
			return;
		}

		this._setAppsSyncProgress(0.04, 'filterUnchangedAppsByChecksum');

		// remove apps that match previously calculated checksum
		var originalStorePayloadLength = storePayload.length;
		this._filterUnchangedAppsByChecksum(storePayload);

		// early exit if all apps were purged by checksum filter
		if (storePayload.length == 0) {
			gs.info("Nothing to do. Filtered Apps: " + originalStorePayloadLength);
			this._setAppsSyncProgress(0.00, 'finished');
			return;
		}

		this.processDeltaAppsOnly = this.processDeltaAppsOnly && isInteractive;
		if (!this.isInstanceOffline && this.processDeltaAppsOnly) {
			this._setAppsSyncProgress(0.05, 'processDeltaAppsOnly');
			this._processDeltaPayload(storePayload, args);
			this._setAppsSyncProgress(0.00, 'finished');
			return;
		}

		gs.info("Processing ({0}) apps: {1}", storePayload.length, JSON.stringify(storePayload));

		this._setAppsSyncProgress(0.06, 'getUpdates');

		var updates = this._getUpdates(storePayload);
		if (!updates) {
			this._setAppsSyncProgress(0.00, 'finished');
			return;
		}

		this._setAppsSyncProgress(0.10, 'filterLocalApps');

		//remove apps where a local version exists
		this._filterLocalApps(updates.appMap);

		this._setAppsSyncProgress(0.11, 'removeInaccessibleRemoteApps');

    //delete existing sys_remote_apps if they aren't in the updates
    this._removeInaccessibleRemoteApps(updates.appMap);

		this._setAppsSyncProgress(0.12, 'removeInaccessibleCustomization');

    // Delete existing sys_app_customizations if they aren't in the updates
    this._removeInaccessibleCustomization(updates.customizationMap);

		this._setAppsSyncProgress(0.13, 'fixLatestVersionForWithdrawnInstalled');

		// Change latest version for withdrawn installed lower version apps/Customizations
		this._fixLatestVersionForWithdrawnInstalledApps(updates.appMap);
		this._fixLatestVersionForWithdrawnInstalledCustomizations(updates.customizationMap);

		this._setAppsSyncProgress(0.14, 'removeWithdrawn');

    // Delete versions from existing sys_app_version/sys_app_customization_version if they aren't in the updates
    this._removeWithdrawnAppVersions(updates.appMap);
    this._removeWithdrawnCustomizationVersions(updates.customizationMap);

		this._setAppsSyncProgress(0.20, 'updateAppRecords');

    // Update app records in sys_store_app, sys_remote_app and sys_app_version tables
    this._updateAppRecords(updates.appMap);

    this._setAppsSyncProgress(0.70, 'updateCustomizations');

    // Update app records in sys_app_customization and sys_app_customization_version tables
    this._updateCustomizations(updates.customizationMap);

		this._setAppsSyncProgress(0.80, 'downloadLogosAsync');

    // update logos async
    this._downloadLogosAsync();

		this._setAppsSyncProgress(0.81, 'countAndSendPushNotification');

    this._countAndSendPushNotification(updates.appMap);

		this._setAppsSyncProgress(0.85, 'refreshStoreResponseCache');

    this.refreshStoreResponseCache(args);

		this._setAppsSyncProgress(0.90, 'populateJumboSpecificTables');

    this.populateJumboSpecificTables(this.jumboCatalog);

		this._setAppsSyncProgress(0.94, 'sn_appclient.products_data_sync');

    //trigger product sync
    gs.eventQueue('sn_appclient.products_data_sync');

		this._setAppsSyncProgress(0.95, 'saveAppChecksumsMap');

    this._saveAppChecksumsMap();

    if (!this.isInstanceOffline) {
      this._setAppsSyncProgress(0.96, 'syncGoldenConfigs');
      this.syncGoldenConfigs();
  	}

    this._setAppsSyncProgress(0.00, 'finished');
  },

    //Method to populate sys_remote_scoped_plugin, sys_app_versions with conditional content, hard, soft dependencies
    populateJumboSpecificTables: function(jumboCatalog) {
         gs.info("populateJumboSpecificTables: " + JSON.stringify(jumboCatalog));
         new JumboAppService( this.isInstanceOffline, jumboCatalog).populateJumboTables();
    },

	syncGoldenConfigs: function() {
		try {
			var scopedAppRepoRequest = new ScopedAppRepoRequest();
			var storeGCResponse = scopedAppRepoRequest.getSuiteConfigsFromStore();
			gs.info("syncGoldenConfigs: GC response from Store: " + storeGCResponse);

			var parsedPayload = this._fetchPayload(storeGCResponse);

			if (!this._validateGoldenConfigPayload(parsedPayload)) {
				gs.error("syncGoldenConfigs: Payload validation failed - aborting");
				return;
			}

			gs.info("syncGoldenConfigs: Marking existing configs as incompatible");
			this._markAllGCsAsIncompatible();

			var self = this;
			parsedPayload.result.configs.forEach(function(configItem) {
				var configPlatform = configItem.platform;
				if (self._doesConfigExist(configPlatform, configItem.version)) {
					gs.info("syncGoldenConfigs: Marking compatible - name={0}, version={1}, platform={2}", [configItem.name, configItem.version, configPlatform]);
					self._markConfigAsCompatible(configPlatform, configItem.version);
				} else {
					gs.info("syncGoldenConfigs: Inserting new config - name={0}, version={1}, platform={2}", [configItem.name, configItem.version, configPlatform]);
					self._createCompatibleGoldenConfigRecord(configItem, configPlatform);
				}
			});
			gs.info("syncGoldenConfigs: GC Sync completed successfully");
		} catch (err) {
			gs.error("syncGoldenConfigs: GC Exception occurred - " + err.message);
		}
	},

	_doesConfigExist: function (platformName, version) {
		var gr = new GlideRecord("sys_suite_config");
		gr.addQuery("platform", platformName);
		gr.addQuery("version", version);
		gr.query();
		return gr.hasNext();
	},

	_markAllGCsAsIncompatible: function(incomingPlatformVersion) {
		var gr = new GlideRecord("sys_suite_config");
		gr.addQuery("compatible", true);
		gr.query();

		while (gr.next()) {
			var name = gr.getValue("name");
			var platform = gr.getValue("platform");
			var version = gr.getValue("version");
			gr.setValue("compatible", false);
			gr.update();
			gs.info("_markAllGCsAsIncompatible: Marked incompatible → name={0}, version={1}, platform={2}", [name, version, platform]);
		}
	},

	_markConfigAsCompatible: function (platformName, version) {
		var gr = new GlideRecord("sys_suite_config");
		gr.addQuery("platform", platformName);
		gr.addQuery("version", version);
		gr.addQuery("compatible", false);
		gr.query();
		if (gr.next()) {
			gr.setValue("compatible", true);
			gr.update();
			gs.info("_markConfigAsCompatible: Updated compatible=true for platform={0}, version={1}", [platformName, version]);
		} else {
		    gs.info("_markConfigAsCompatible: No update needed - already compatible or record not found for platform={0}, version={1}", [platformName, version]);
		}
	},

	_createCompatibleGoldenConfigRecord: function (cfg, fallbackPlatform) {
		var sysId = this._insertGoldenConfig(cfg, fallbackPlatform);
		this._insertGoldenConfigApps(sysId, cfg.applications);
		gs.info("_createCompatibleGoldenConfigRecord: Inserted new Golden Config - sys_id={0}, name={1}, version={2}", [sysId, cfg.name, cfg.version]);
	},

	_fetchPayload: function(goldenConfigAPIResponse) {
		if (gs.nil(goldenConfigAPIResponse))
			throw new Error("Golden-Config response is empty");

		var parsed;
		try {
			parsed = this.json.decode(goldenConfigAPIResponse);
		} catch (e) {
			throw new Error("Golden-Config response is not valid JSON:\n" + goldenConfigAPIResponse);
		}

		if (parsed.result && Array.isArray(parsed.result.configs))
			return parsed;

		if (parsed.error && parsed.error.message)
			throw new Error("Golden-Config sync: " + parsed.error.message +
							(parsed.error.detail ? (" - " + parsed.error.detail) : ""));

		throw new Error("Golden-Config response: unrecognized format:\n" + goldenConfigAPIResponse);
	},

	_validateGoldenConfigPayload: function(payloadData) {
		if (gs.nil(payloadData)) {
			gs.error("syncGoldenConfigs: input 'payloadData' is null/undefined. Aborting.");
			return false;
		}
		if (gs.nil(payloadData.result)) {
			gs.error("syncGoldenConfigs: 'payloadData.result' missing. Aborting.");
			return false;
		}

		var requiredGoldenConfigFields = ['name', 'version', 'platform', 'type', 'applications'];
		var requiredAppFields = ['scope_name', 'version'];

		for (var gcIndex = 0; gcIndex < payloadData.result.configs.length; gcIndex++) {
			var goldenConfig = payloadData.result.configs[gcIndex];
			var goldenConfigIdStr = gs.getMessage("[name={0}, version={1}]", [goldenConfig.name || "?", goldenConfig.version || "?"]);

			for (var gcFieldIndex = 0; gcFieldIndex < requiredGoldenConfigFields.length; gcFieldIndex++) {
				var goldenConfigField = requiredGoldenConfigFields[gcFieldIndex];
				if (gs.nil(goldenConfig[goldenConfigField])) {
					gs.error("syncGoldenConfigs: golden config {0} missing field '{1}'", [goldenConfigIdStr, goldenConfigField]);
					return false;
				}
			}

			if (!Array.isArray(goldenConfig.applications) || goldenConfig.applications.length === 0) {
				gs.error("syncGoldenConfigs: golden config {0} has empty applications array", [goldenConfigIdStr]);
				return false;
			}

			for (var appIndex = 0; appIndex < goldenConfig.applications.length; appIndex++) {
				var application = goldenConfig.applications[appIndex];
				var applicationIdStr = gs.getMessage("[scope={0}, version={1}]", [application.scope_name || "?", application.version || "?"]);

				requiredAppFields.forEach(function(appField) {
					if (gs.nil(application[appField])) {
						gs.error("syncGoldenConfigs: golden config {0} has application {1} missing field '{2}'", [goldenConfigIdStr, applicationIdStr, appField]);
						return false;
					}
				});
			}
		}
		return true;
	},

	_insertGoldenConfig: function(goldenConfigData, fallbackPlatformVersion) {
		if (gs.nil(goldenConfigData)) {
			gs.error("_insertGoldenConfig: goldenConfigData is null/undefined");
			return null;
		}

		var goldenConfigRecord = new GlideRecord("sys_suite_config");
		goldenConfigRecord.initialize();
		goldenConfigRecord.setValue("name", goldenConfigData.name);
		goldenConfigRecord.setValue("version", goldenConfigData.version);
		goldenConfigRecord.setValue("platform", goldenConfigData.platform || fallbackPlatformVersion);
		goldenConfigRecord.setValue("type", goldenConfigData.type);
		goldenConfigRecord.setValue("installed", false);
		goldenConfigRecord.setValue("compatible", true);

		var insertedSysId = goldenConfigRecord.insert();

		if (!insertedSysId)
			throw new Error(gs.getMessage("_insertGoldenConfig: insert failed for name={0}, version={1}", [goldenConfigData.name || "?", goldenConfigData.version || "?"]));

		gs.info("_insertGoldenConfig: inserted GC -> {0}@{1} (sys_id={2})", [goldenConfigData.name, goldenConfigData.version, insertedSysId]);

		return insertedSysId;
	},

	_insertGoldenConfigApps: function(goldenConfigSysId, applicationList) {
		if (gs.nil(goldenConfigSysId)) {
			gs.error("_insertGoldenConfigApps: goldenConfigSysId is null/undefined");
			return;
		}
		if (!applicationList || !applicationList.length) {
			gs.error("_insertGoldenConfigApps: applicationList is missing/empty for goldenConfigSysId={0}", [goldenConfigSysId]);
			return;
		}

		for (var appIndex = 0; appIndex < applicationList.length; appIndex++) {
			var applicationData = applicationList[appIndex];

			if (!applicationData || !applicationData.scope_name || !applicationData.version) {
				gs.error("_insertGoldenConfigApps: skipping invalid application entry for goldenConfigSysId={0} at index={1}", [goldenConfigSysId, appIndex]);
				continue;
			}

			var goldenConfigAppMapping = new GlideRecord("sys_suite_config_app_version_m2m");
			goldenConfigAppMapping.setValue("suite_config", goldenConfigSysId);
			goldenConfigAppMapping.setValue("app_scope", applicationData.scope_name);
			goldenConfigAppMapping.setValue("app_version", applicationData.version);

			var insertedMappingId = goldenConfigAppMapping.insert();

			if (!insertedMappingId) {
				throw new Error(gs.getMessage("_insertGoldenConfigApps: insert failed for application {0}@{1} (goldenConfigSysId={2})", [applicationData.scope_name, applicationData.version, goldenConfigSysId]));
			}
		}
	},

    refreshStoreResponseCache: function(args) {
		if(!this.appManagerCacheEnabled)
			return;
		if (gs.nil(args)){
			args = {
				"sharedInternally" : false,
				"forceUpdate" : false,
				"isMaint" : false
			}
		}
		// prevent undefines to throw null pointer exceptions
		var sharedInternally = !!args.sharedInternally;
		var forceUpdate = !!args.forceUpdate;
		var isMaint = !!args.isMaint;
		var cacheLastUpdatedTime = new global.AppManagerCache().getCacheLastUpdatedTime({key: "storeResponse", sharedInternally: sharedInternally});
		this.registerDbUpdatesForLatestUpdatedSysStoreApps(cacheLastUpdatedTime); // this is done so that cache gets updated after CI/CD install
		this.registerDbUpdatesForLatestUpdatedSysCustomizations(cacheLastUpdatedTime); // this is done so that cache gets updated after customization publish
		new AppsData(isMaint).putStoreResponseInAppManagerCache(sharedInternally, this.appsUpdatedInDB, forceUpdate);
		if(forceUpdate) {
			new AppsData(isMaint).putStoreResponseInAppManagerCache(!sharedInternally, this.appsUpdatedInDB, forceUpdate);
		}
	},

	registerDbUpdatesForLatestUpdatedSysStoreApps: function(cacheLastUpdatedTime) {
		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addQuery("sys_updated_on", ">=", cacheLastUpdatedTime);
		storeAppGr.query();
		while (storeAppGr.next()) {
			this._registerDbUpdates(storeAppGr.getUniqueValue());
		}
	},

	registerDbUpdatesForLatestUpdatedSysCustomizations: function(cacheLastUpdatedTime) {
		var custGr = new GlideRecord("sys_app_customization");
		custGr.addQuery("sys_updated_on", ">=", cacheLastUpdatedTime);
		custGr.query();
		while (custGr.next()) {
			this._registerDbUpdates(custGr.vendor_app.toString());
		}
	},

	deleteAppManagerCache: function() {
		if(this.appManagerCacheEnabled)
			new global.AppManagerCache().deleteAllCache();
	},

	_updateAppRecords: function(appMap) {
        var appMapIndex = 0;
        var appMapLength = Object.keys(appMap).length;

        for(var prop in appMap) {
            if (++appMapIndex % 100 == 0) {
              // both parent calls start at 0.20 and end at 0.70, so we just take 50% of the processed records here:
							this._setAppsSyncProgress(0.20 + ((appMapIndex / appMapLength) / 2.0) , 'updateAppRecords');
            }

            var update = appMap[prop];
            var app = this._getApp(update.source_app_id);

            this._setRelevantVersion(update, app);
            this._filterAndUpdateAppRecords(update, app);

            if (this.isInstanceOffline && update[update.relevant_version].hasOwnProperty('logo_hash') && update[update.relevant_version].logo_hash != this.constants.NO_LOGO_EXIST)
                this.downloadLogoList.push(update);
        }
    },

	_updateCustomizations: function(customizationMap) {
        for (var prop in customizationMap) {
            var update = customizationMap[prop];
            var customization = this._getCustomization(update.source_customization_id);

            this._getLatestVersionForCustomization(update);
            this._filterAndUpdateCustomizations(update, customization);
        }
    },

	_fetchAppUpdates: function(isInteractive, honourChecksum, cacheArgs, checkUpdateMutex) {
		var isMutexAvailable = sn_app_api.AppStoreAPI.isUpdateMutexAvailable();
		if(gs.isPaused() || (checkUpdateMutex && !isMutexAvailable)) {
			gs.info("checkAvailableUpdates returning without calling repo as another operation is in progress");
			return;
		}
		if (gs.getProperty("sn_appclient.client_calls_allowed", "true") == "false" && !this.isInstanceOffline) {
			gs.info("checkAvailableUpdates returning without calling repo as client_calls_allowed is false");
			return;
		}

		var payload = !this.isInstanceOffline ? this._getAvailableStoreUpdates(honourChecksum, cacheArgs) : this._getOfflineUpdates();
		this.canSendNotification = !isInteractive && payload.opstatus == 2 && this.canSendNotification;

		// opstatus indicates the payload has changed from the last update
		if(payload.opstatus == 0)
			return;

        return payload.data;
	},

	/**
	 * Retrieves available updates for this instance from the central app repository
	 */
	_getAvailableStoreUpdates : /*[sys_store_app,...]*/ function(honourChecksum, cacheArgs) {
		var gu = new GlideUpgradeUtil();
		var installedAppsJson = this._getInstalledApplicationsJSON();
		var installedCustomizationsJSON = this._getInstalledCustomizationsJSON();
		var parms = {
			glide_build: gu.getCurrentBuild(),
			glide_build_name: gu.getCurrentBuildName(),
			applications: installedAppsJson,
            		customizations: installedCustomizationsJSON,
			plugin_activation_enforcement_mode: this._getPluginActivationEnforcementMode(),
			is_instance_licensing_aware: this._getIsInstanceLicenseAware()
		};
		var scopedAppRepoRequestObj = new ScopedAppRepoRequest("get_all_available_apps");
		var candidateUpdateResponse = scopedAppRepoRequestObj
					//.addHeader("Accept-Encoding", "gzip, deflate, br")
					.setParameter("send_logo_sys_id", true)
					.setParameter("glide_build", parms.glide_build)
					.setParameter("glide_build_name", parms.glide_build_name)
					.setParameter("applications", parms.applications)
					.setParameter("customizations", parms.customizations)
					.setParameter("plugin_activation_enforcement_mode", parms.plugin_activation_enforcement_mode)
					.setParameter("is_instance_licensing_aware", parms.is_instance_licensing_aware)
					.setParameter("schedule_install_check",this.checkAppEntitlements)
					.setParameter("instance_checksum", gs.getProperty("sn_appclient.last.processed.checksum"))
					.setParameter("specific_apps_to_update", this.specificAppsToUpdate)
					.setQuiet(this._quiet)
					.post();
		var candidateUpdates = [];
		var currentChecksum = gs.getProperty("sn_appclient.last.processed.checksum");

		// Bypass checksum if a snapshot version is found
		if(JSON.stringify(candidateUpdateResponse).includes("-SNAPSHOT")) {
			honourChecksum = false;  // Force processing by setting honourChecksum to false if a snapshot version is present
		}

		var calculatedChecksum = new GlideDigest().md5_digest(candidateUpdateResponse + installedAppsJson + installedCustomizationsJSON);
		var checksumModified = currentChecksum != calculatedChecksum;
		var errorMessage = scopedAppRepoRequestObj.getErrorMessage();
		var statusCode = scopedAppRepoRequestObj.getStatusCode();
		this._updateLatestErrorMessage(errorMessage, statusCode);

		if ((honourChecksum && !checksumModified) || statusCode == 401 || statusCode == 412) {
			if (!errorMessage)
				errorMessage = "Ignoring updates as there is no difference in payload from last received one";

			gs.debug(errorMessage);

			return {
				opstatus : 0,
				data : candidateUpdates
			};
		} else if (statusCode == 0 || statusCode == 408 || statusCode == 429) {
		    // Status Code = 0 will most likely will be a socket timeout - so handle as timeout
		    // Status Code 408 = Request Timeout
		    // Status Code 429 = Too Many Requests
		    if (statusCode == 429)
		        errorMessage = "Too Many Requests (429)";
		    else
		        errorMessage = "Request Timeout (408)";

		    cacheArgs.forceUpdate = true;
		    this.refreshStoreResponseCache(cacheArgs);
		    throw new Error(errorMessage);
		}

		gs.eventQueue("sn_appclient.update.system.property", null, "sn_appclient.last.processed.checksum", calculatedChecksum);
		try {
			//if talking to localhost response will be 200-OK but content is Page not Found
			candidateUpdates = this.json.decode(candidateUpdateResponse);
		} catch (e) {
			gs.error("Unable to parse response from App Repo. The server may not be active >> {0}", candidateUpdateResponse);
		}

		if (null == candidateUpdates || typeof candidateUpdates.push !=='function')
			candidateUpdates = [];

		gs.debug("Got ({0}) candidate updates: {1}", candidateUpdates.length, this.json.encode(candidateUpdates));

        CommonUtils.setSystemProperty(
              "sn_appclient.apps_last_sync_time", "value", new GlideDateTime()
              );

		return {
			opstatus : checksumModified ? 2 : 1,
			data : candidateUpdates
		};
	},

	updateInstalledAppsInStore: function() {
		var installedAppsJson = this._getInstalledApplicationsJSON();
		var installedCustomizationsJSON = this._getInstalledCustomizationsJSON();
		var parms = {
			applications: installedAppsJson,
			customizations: installedCustomizationsJSON,
		};

		var scopedAppRepoRequestObj = new ScopedAppRepoRequest("update_installed_apps");
		var response = scopedAppRepoRequestObj
					.setParameter("applications", parms.applications)
					.setParameter("customizations", parms.customizations)
					.setQuiet(this._quiet)
					.post();
		gs.info("Response for update_installed_apps: " + response);
	},

	updateInstalledAppsInStoreAsync: function() {
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName("Updating Installed Apps In Store");
		worker.setBackground(true);
		worker.setCannotCancel(true);
		worker.setScriptIncludeName("sn_appclient.UpdateChecker");
		worker.setScriptIncludeMethod("updateInstalledAppsInStore");
		worker.start();
		return worker.getProgressID();
	},

	_updateLatestErrorMessage: function(errorMessage, statusCode) {
		if(!errorMessage || statusCode !== 412)
			errorMessage = "";
		var gr = new GlideRecord("sn_appclient_store_outbound_http_quota");
		gr.get("request_type", "get_all_available_apps");
		if (gr.isValidRecord()) {
			gr.last_request_error_message = errorMessage;
			gr.update();
		}
	},

	_downloadLogosAsync: function() {
		if(this.isInstanceOffline)
			gs.eventQueue('sn_appclient.update.logos', null, JSON.stringify(this.downloadLogoList));
	},

	/**
	 * Downloads the logos for all apps
	 * Called by script action UpdateLogos
	 */
	downloadLogos: function(newestLogoVersions) {
		var logoDownloader = new LogoDownloader();
		gs.info("Updating logo for: {0}", this.json.encode(newestLogoVersions));
		logoDownloader.downloadLogoForApps(newestLogoVersions);
	},

	refreshChecksum: function() {
		gs.info("Refreshing sn_appclient.last.processed.checksum");
		var props = {};
		props["sn_appclient.last.processed.checksum"] = "";
		new GlideAppLoader().setAuthorProperties(props);
	},

	_getUpdates: function(data) {
		return {
		    appMap : this._getUpdatesMap(data),
		    customizationMap : this._getCustomizationMap(data)
		};
	},

	_getUpdatesMap: function(updates) {
		var updatesMap = {};
		if(!updates || updates.length <= 0)
			return updatesMap;

		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			if(!this._isAppFieldsValid(update))
				continue;

			updatesMap[update.source_app_id] = update;

			for (var j = 0; j < update.versions.length; j++) {
				var versionObj = update.versions[j];
				updatesMap[update.source_app_id][versionObj.version] = versionObj;
			}
			delete updatesMap[update.source_app_id].versions;

		}
		return updatesMap;
	},

	_getCustomizationMap: function(updates) {
		var customizationMap = {};
		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			if (!this._isCustomizationFieldsValid(update))
				continue;

			var customizations = update.customizations;
			customizations.scope = update.scope;
			customizations.app_id = update.source_app_id;
			customizationMap[update.source_app_id] = customizations;

			for (var j = 0; j < customizations.versions.length; j++) {
				var version = customizations.versions[j];
				customizationMap[update.source_app_id][version.customization_version] = version;
			}
			delete customizationMap[update.source_app_id].customizations;
		}

		return customizationMap;
	},

	_getDeltaCustomizationMap: function(payload) {
		var customizationMap = {};

		var custGr = new GlideRecord("sys_app_customization");
		custGr.query();

		var loadedMap = {};
		while (custGr.next()) {
			if (!loadedMap[custGr.getUniqueValue()]) loadedMap[custGr.getUniqueValue()] = {};
			loadedMap[custGr.getUniqueValue()].id = custGr.getUniqueValue();
			loadedMap[custGr.getUniqueValue()].installed = custGr.version.toString();
			loadedMap[custGr.getUniqueValue()].processed = false;
		}

		var verGr = new GlideRecord("sys_app_customization_version");
		verGr.query();

		while (verGr.next()) {
			if (!loadedMap[verGr.app_customization]) loadedMap[verGr.app_customization] = {};
			if (!loadedMap[verGr.app_customization][verGr.version]) loadedMap[verGr.app_customization][verGr.version] = {};
		}

		for (var i = 0; i < payload.length; i++) {
			var changes = false;

			var app = payload[i];
			if (!this._isCustomizationFieldsValid(app))
				continue;

			var customizations = app.customizations;
			customizations.scope = app.scope;
			customizations.app_id = app.source_app_id;

			var installed = "none";
			if (!loadedMap.hasOwnProperty(customizations.source_customization_id))
				changes = true;
			else
				installed = loadedMap[customizations.source_customization_id].installed;

			for (var j = 0; j < customizations.versions.length; j++) {
				var version = customizations.versions[j];
				if (installed != "none") {
					if (!this.versionComparator.isUpgrade(installed, version.customization_version))
						continue;
				}

				if (!changes && !loadedMap[customizations.source_customization_id][version.customization_version])
					changes = true;

				customizations[version.customization_version] = version;
			}

			if (changes)
				customizationMap[app.source_app_id] = customizations;

            // Done processing - remove from loaded map to mark that it was found
            if (loadedMap.hasOwnProperty(customizations.source_customization_id))
                loadedMap[customizations.source_customization_id].processed = true;

			delete customizations.customizations;
			delete app.customizations;
		}

		if(this.specificAppsToUpdate !== "[]")
			return customizationMap;

        // Remove all the customizations that were not in the payload
        for (var key in loadedMap) {
            var cust = loadedMap[key];

            if (!cust.processed) {
                gs.info("Removing Customization: " + cust.id);

                verGr = new GlideRecord("sys_app_customization_version");
                verGr.addQuery("app_customization", cust.id);
                verGr.query();
                if (verGr.getRowCount() > 0)
                    verGr.deleteMultiple();

                custGr = new GlideRecord("sys_app_customization");
                custGr.get(cust.id);
                if (custGr.isValidRecord()) {
                    var ver = custGr.getValue("version");
                    if ((gs.nil(ver) || ver == "none"))
                        custGr.deleteRecord();
                }
            }
        }

		return customizationMap;
	},

    _countAndSendPushNotification: function(updatesMap) {
        if(this.canSendNotification){
            this._checkIndicatorsCountForInstalledAppsWithNoStoreData(updatesMap);

            Object.keys(this.appNotificationConfig).forEach(function(item){
                this.totalAppNotificationCount += this.appNotificationConfig[item]["count"];
            }, this);

            if(this.totalAppNotificationCount > 0)
                this._sendPushNotification();
        }
    },

	_isAppFieldsValid: function(app) {
		var requiredFields = ["scope", "source_app_id", "versions"];
		var invalidFields = [];
		requiredFields.forEach(function(key) {
			if(!app[key])
				invalidFields.push(key);
		});

		if(invalidFields.length > 0) {
			gs.debug("Removing app {0} from the list as the required fields {1} are missing.",[app.app_name, invalidFields.join()]);
			return false;
		}
		return true;
	},

	_isCustomizationFieldsValid: function(app) {
		var requiredFields = ["scope", "source_app_id", "customizations"];
		var invalidFields = [];
		requiredFields.forEach(function(key) {
			if (!app[key])
				invalidFields.push(key);
		});

        if (invalidFields.length == 0) {
            var customizations = app.customizations;
            requiredFields = ["source_customization_id", "versions"];
            requiredFields.forEach(function(key) {
                if (!customizations[key])
                    invalidFields.push(key);
            });
        }

		if (invalidFields.length > 0) {
			gs.debug("Removing customizations {0} from the list as the required fields {1} are missing.", [app.app_name, invalidFields.join()]);
			return false;
		}

		return true;
	},

	_getInstalledApplicationsJSON: function() {
		var applications = new GlideRecord("sys_scope");
		applications.addQuery("sys_class_name", "IN", "sys_store_app,sys_app");
		applications.addQuery("sys_id", "!=", "global");
		applications.query();
		var appRay = [];
		var sysStoreAppGr = new GlideRecord("sys_store_app");
		var last_installed_from;
		var installation_info;

		while (applications.next()) {
			last_installed_from = "";
			if(applications.sys_class_name == "sys_store_app" && sysStoreAppGr.get(applications.sys_id)) {
				last_installed_from = sysStoreAppGr.last_installed_from;
				installation_info = sysStoreAppGr.getValue("installation_info");
			}

			var app = {
				source_app_id: applications.sys_id.toString(),
				source: applications.source.toString(),
				scope: applications.scope.toString(),
				active: applications.active.toString(),
				version: applications.version.toString(),
				vendor: applications.vendor.toString(),
				vendor_prefix: applications.vendor_prefix.toString(),
				sys_class_name: applications.sys_class_name.toString(),
				name: applications.name.toString(),
				scoped_administration: applications.scoped_administration.toString(),
				last_installed_from: last_installed_from.toString(),
				installation_info : installation_info
			};
			appRay.push(app);
		}
		var text = this.json.encode(appRay);
		gs.debug("installedAppsJson: " + text);
		return text;
	},

	_getInstalledCustomizationsJSON: function() {
		var customizations = new GlideRecord("sys_app_customization");
		customizations.addQuery("version", "!=", "none");
		customizations.query();

		var results = [];
		while (customizations.next()) {
			var customization = {
				source_app_id: customizations.sys_id.toString(),
				source: customizations.vendor_app.scope.toString(),
				scope: customizations.vendor_app.scope.toString(),
				active: customizations.vendor_app.active.toString(),
				version: customizations.version.toString(),
				sys_class_name: customizations.getTableName(),
				installation_info : customizations.vendor_app.installation_info.toString() || "{}",
				base_app_version : customizations.vendor_app_version.toString()
			};
			results.push(customization);
		}

        gs.info("Installed Customizations: " + this.json.encode(results));
		return this.json.encode(results);
	},

	_removeInaccessibleJumboApps: function(source_app_id, version) {
		if (gs.nil(source_app_id))
			return;

		gs.info("Removing inaccessible sys_remote_scoped_plugin: {0}, {1} ", source_app_id, version);
		var remoteScopedPlugins = new GlideRecord("sys_remote_scoped_plugin");
		remoteScopedPlugins.addQuery("source_app_id", source_app_id);
		if (!gs.nil(version)) {
			remoteScopedPlugins.addQuery("version", version);
		}
		remoteScopedPlugins.query();
		gs.info("Deleting " + remoteScopedPlugins.getRowCount() + " records");
		remoteScopedPlugins.deleteMultiple();
		if (this.appChecksumsCacheEnabled) {
			this._removeAppFromChecksumsMap(source_app_id);
		}
	},

	/*
	* Deletes sys_remote_app records, if the records sys_id isn't provided as one of the
	* apps sent by the store
	*/
	_removeInaccessibleRemoteApps: /*void*/ function(/*array of hash*/accessible) {
		gs.debug("Removing all inaccessible apps");

		var allRemoteApps = new GlideRecord("sys_remote_app");
		allRemoteApps.addQuery("optional_apps_available", "!=", "true");
		if (this.appChecksumsCacheEnabled) {
			allRemoteApps.addQuery("source_app_id", "NOT IN", this.appsFilteredByChecksum);
		}
		allRemoteApps.query();
		while (allRemoteApps.next()) {
			var candidate_app_id = allRemoteApps.sys_id.toString();
			var candidate_scope = allRemoteApps.scope.toString();
			if (typeof accessible[candidate_app_id] == 'undefined') {
				gs.info("Removing inaccessible sys_remote_app: {0} ({1})", candidate_scope, candidate_app_id);
				this._registerDbUpdates(allRemoteApps.getUniqueValue());
				this._removeInaccessibleJumboApps(candidate_app_id);
				allRemoteApps.deleteRecord();
				if (this.appChecksumsCacheEnabled) {
					this._removeAppFromChecksumsMap(allRemoteApps.source_app_id.toString());
				}
			}
		}
	},

	/*
	 * Deletes sys_app_customization records, if the records vendor_app isn't provided as one of the
	 * apps sent by the store and customization is not installed
	 */
	_removeInaccessibleCustomization: /*void*/ function(/*array of hash*/ accessible) {
		gs.debug("Removing all inaccessible customizations");

		var gr = new GlideRecord("sys_app_customization");
		if (this.appChecksumsCacheEnabled) {
			gr.addQuery("vendor_app", "NOT IN", this.appsFilteredByChecksum);
		}
		gr.query();
		while (gr.next()) {
			var base_id = gr.getValue("vendor_app");
			var ver = gr.getValue("version");

			gs.info("Checking Customization: {0} - {1} / {2}", base_id, ver, accessible.hasOwnProperty(base_id));

			this._registerDbUpdates(gr.vendor_app);
			if (gs.nil(base_id)) {
				gs.info("Removing sys_app_customization with null base app");
				gr.deleteRecord();
			} else if (!accessible.hasOwnProperty(base_id) && (gs.nil(ver) || ver == "none")) {
				gs.info("Removing inaccessible sys_app_customization: {0}", base_id);
				gr.deleteRecord();
			}
			if (this.appChecksumsCacheEnabled) {
				this._removeAppFromChecksumsMap(base_id);
			}
		}
	},

	_fixLatestVersionForWithdrawnInstalledApps: function(updatesMap) {
		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addActiveQuery();
		if (this.appChecksumsCacheEnabled) {
			storeAppGr.addQuery("sys_id", "NOT IN", this.appsFilteredByChecksum);
		}
		storeAppGr.query();

		while(storeAppGr.next()) {
			var storeAppVersion = storeAppGr.getValue("version");
			var storeAppLatestVersion = storeAppGr.getValue("latest_version");
			if(gs.nil(updatesMap[storeAppGr.getValue("sys_id")]) && !this.versionComparator.isEqual(storeAppVersion, storeAppLatestVersion)) {
				storeAppGr.setValue("latest_version", storeAppVersion);
				storeAppGr.update();
				this._registerDbUpdates(storeAppGr.getUniqueValue());
			}
		}

	},

	_fixLatestVersionForWithdrawnInstalledCustomizations: function(customizationMap) {
		var customization = new GlideRecord("sys_app_customization");
		if (this.appChecksumsCacheEnabled) {
			customization.addQuery("vendor_app", "NOT IN", this.appsFilteredByChecksum);
		}
		customization.query();

		while (customization.next()) {
			var version = customization.getValue("version");
			var latest = customization.getValue("latest_version");
			if (gs.nil(customizationMap[customization.getValue("sys_id")]) && !this.versionComparator.isEqual(version, latest)) {
				customization.setValue("latest_version", version);
				customization.update();
				this._registerDbUpdates(customization.vendor_app);
			}
		}
	},

	_filterLocalApps: /*array*/function (/*array of hashes*/ updatesMap) {
		var localAppsGr = new GlideRecord("sys_app");
		if (this.appChecksumsCacheEnabled) {
			localAppsGr.addQuery("sys_id", "NOT IN", this.appsFilteredByChecksum);
		}
		localAppsGr.query();

		while(localAppsGr.next()) {
			var candidate_app_id = localAppsGr.sys_id.toString();
			if (!gs.nil(updatesMap[candidate_app_id])) {
				gs.info("Removing local app {0} from the list", updatesMap[candidate_app_id].app_name);
				delete updatesMap[candidate_app_id];
			}
		}

	},

	_filterAndUpdateAppRecords: function(update, /*[sys_store_app/sys_remote_app]*/app) {
		var propertiesToCompare = ["latest_version", "dependencies", "price_type", "lob", "indicators", "display_message", "compatibilities",
			"short_description", "name", "is_store_app", "block_install", "block_message", "upload_info", "needs_app_engine_licensing",
            "custom_table_count", "products", "store_latest_updated_time", "repo_latest_updated_time", "logo"];

		gs.debug("Checking app update {0}:{1} ({2})", update.scope, update.relevant_version, update.source_app_id);
		var includeUpdate = false;
		var includeReason = null;

		if (app === null) {
			includeUpdate = true;
			includeReason = "New app";
			app = this._createRemoteApp(update);
		} else if (!this._areEqualBoolean(app.shared_internally, update.shared_internally ? update.shared_internally : false)) {
			includeUpdate = true;
			includeReason = "Shared internally";
		} else if (app.isValidField('auto_update') &&
			update.hasOwnProperty('auto_update') &&
			!this._areEqualBoolean(app.auto_update, update.auto_update)) {
			includeUpdate = true;
			includeReason = "Auto update change";
		} else if (app.isValidField('uninstall_blocked') &&
			update.hasOwnProperty('uninstall_blocked') &&
			!this._areEqualBoolean(app.uninstall_blocked, update.uninstall_blocked)) {
			includeUpdate = true;
			includeReason = "Uninstall blocked change";
		} else if (app.isValidField('hide_on_ui') &&
			update.hasOwnProperty('hide_on_ui') &&
			!this._areEqualBoolean(app.hide_on_ui, update.hide_on_ui)) {
			includeUpdate = true;
			includeReason = "Hidden on ui change";
		} else if (app.isValidField('installed_as_dependency') &&
			update.hasOwnProperty('installed_as_dependency') &&
			!this._areEqualBoolean(app.installed_as_dependency, update.installed_as_dependency)) {
			includeUpdate = true;
			includeReason = "Installed as dependency change";
		} else if (app.isValidField('sn_managed') &&
			update.hasOwnProperty('sn_managed') &&
			!this._areEqualBoolean(app.sn_managed, update.sn_managed)) {
			includeUpdate = true;
			includeReason = "ServiceNow managed change";
		} else if (app.isValidField('latest_version') && !gs.nil(app.latest_version) && app.latest_version.includes("-SNAPSHOT")) {
			includeUpdate = true;
			includeReason = "Installed as Snapshot, for Jumbo App";
		}

		if (!includeUpdate) {
			for (var i = 0; i < propertiesToCompare.length; i++) {
				var propertyName = propertiesToCompare[i];
				if(!app.isValidField(propertyName)) continue;

				var appPropertyValue = app[propertyName];
				var updatePropertyValue = update[propertyName] || update[update.relevant_version][propertyName];

				if (propertyName == "lob" || propertyName == "indicators" || propertyName == "products")
					updatePropertyValue = updatePropertyValue ? JSON.stringify(updatePropertyValue) : "[]";

				if (propertyName == "name")
					updatePropertyValue = update.app_name;

				if(propertyName == "logo")
					updatePropertyValue = update[update.relevant_version]["logo_sys_id"];

				if (!this._areEqual(appPropertyValue, updatePropertyValue)) {
					includeUpdate = true;
					includeReason = "Property change: " + propertyName;
					break;
				}
			}
			if( app.getRecordClassName() == "sys_store_app" && this.versionComparator.isUpgrade(app.version, update.latest_version) ){
				includeUpdate = true;
			}
		}

		if (includeUpdate) {
			// update sys_store_app / sys_remote_app record
			gs.debug("Including app update {0}:{1} ({2}) - {3}", update.source_app_id, update.relevant_version, update.scope, includeReason);
			this._updateLatestVersionFields(update, app);
			if(update[update.relevant_version].is_jumbo)
				this.jumboCatalog.push({source_app_id: update.source_app_id, versions: [update.relevant_version]});
		}

		// update sys_app_version record
		this._refreshVersions(app, update);
	},

	_filterAndUpdateCustomizations: function(update, /*sys_app_customization*/ customization) {
		gs.debug("Checking customization update {0}: {1}", update.scope, update.app_id);

		if (customization === null) {
			customization = this._createCustomization(update);
		} else if (customization.getValue("latest_version") != update.latest_version) {
			var vendorApp = this._getApp(customization.getValue("vendor_app"));
			if(vendorApp != null) {
				if(vendorApp.getRecordClassName() == "sys_store_app" && this.versionComparator.isUpgrade(customization.getValue("latest_version"),update.latest_version))
					vendorApp.setValue("update_available", true);
				vendorApp.setValue("customization", customization.getValue("sys_id"));
				vendorApp.update();
			}
			customization.setValue("latest_version", update.latest_version);
			customization.update();
			this._registerDbUpdates(customization.vendor_app);
		}

		// update sys_app_customization_version record
		this._refreshCustomizationVersions(customization, update);
	},

	_isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		return this.versionComparator.isDowngrade(currentVersion, targetVersion);
	},

	_updateLatestVersionFields: /*boolean*/ function(/*Hash*/ update, app) {
		if (app.getRecordClassName() == "sys_store_app" && !this._areEqual(app.version, update.relevant_version)){
			gs.info("No need to update values, local app is a different version. Updating only relevant fields.");
			app.setValue("is_store_app", update.is_store_app);
			app.setValue("update_available", this.versionComparator.isUpgrade(app.version, update.relevant_version));
			app.setValue("auto_update", update.auto_update);
			app.setValue("latest_version", update.latest_version);
			app.setValue("products", JSON.stringify(update.products || []));
			app.setValue("shared_internally", update.shared_internally ? update.shared_internally : false);
			app.setValue("uninstall_blocked", update.uninstall_blocked);
			app.setValue("hide_on_ui", update.hide_on_ui);
			app.setValue("installed_as_dependency", update.installed_as_dependency);
			if (app.isValidField("sn_managed") && update.hasOwnProperty("sn_managed"))
				app.setValue("sn_managed", update.sn_managed);
			if(!this.isInstanceOffline)
				app.setValue("logo", update[update.relevant_version]["logo_sys_id"]);
			app.update();
			this._registerDbUpdates(app.getUniqueValue());
			return;
		}
		this._updateApp(app, update);
	},

	_updateApp: /*void*/ function(/*GlideRecord sys_remote_app | sys_store_app*/ app, /*{}*/ update) {
		app.setValue("latest_version", update.latest_version);
		app.setValue("needs_app_engine_licensing", update[update.relevant_version].needs_app_engine_licensing);
		app.setValue("custom_table_count", update[update.relevant_version].custom_table_count);
		app.setValue("name", update.app_name);
		app.setValue("dependencies", update[update.relevant_version].dependencies);
		if (update.short_description)
			app.setValue("short_description", update[update.relevant_version].short_description);
        app.setValue("compatibilities", update[update.relevant_version].compatibilities);
        app.setValue("is_store_app", update[update.relevant_version].is_store_app);
        app.setValue("shared_internally", update.shared_internally ? update.shared_internally : false);
		app.setValue("price_type", update[update.relevant_version].price_type ? update[update.relevant_version].price_type : "");
		app.setValue("lob", (JSON.stringify(update[update.relevant_version].lob) || '[]'));
		app.setValue("indicators", (JSON.stringify(update[update.relevant_version].indicators) || '[]'));
		app.setValue("display_message", update[update.relevant_version].display_message ? update[update.relevant_version].display_message : "");
		app.setValue("upload_info", update[update.relevant_version].upload_info ? update[update.relevant_version].upload_info : "");
		app.setValue("products", JSON.stringify(update.products || []));
		if (app.isValidField("auto_update"))
			app.setValue("auto_update", update.auto_update);
        if (app.isValidField("block_install"))
            app.setValue("block_install", update[update.relevant_version].block_install);
        if (app.isValidField("block_message"))
            app.setValue("block_message", update[update.relevant_version].block_message);
		if (app.isValidField("delivery_source"))
			if(update[update.relevant_version].delivery_source)
				app.setValue("delivery_source",update[update.relevant_version].delivery_source);
			else
				app.setValue("delivery_source",'store');
		if (app.isValidField("store_latest_updated_time"))
			app.setValue("store_latest_updated_time", update[update.relevant_version]["store_latest_updated_time"]);
		if (app.isValidField("repo_latest_updated_time"))
			app.setValue("repo_latest_updated_time", update[update.relevant_version]["repo_latest_updated_time"]);
		app.setValue("uninstall_blocked", update.uninstall_blocked);
		app.setValue("hide_on_ui",update.hide_on_ui);
		app.setValue("installed_as_dependency", update.installed_as_dependency);
		if (app.isValidField("sn_managed") && update.hasOwnProperty("sn_managed"))
			app.setValue("sn_managed", update.sn_managed);
		if(!this.isInstanceOffline)
			app.setValue("logo", update[update.relevant_version]["logo_sys_id"]);
		app.setWorkflow(true); // ensure workflow is enabled
		if (app.getRecordClassName() == "sys_store_app")
		    app.setValue("update_available", this.versionComparator.isUpgrade(app.version, update.latest_version));
		app.contains_plugins = update[update.relevant_version].is_jumbo;
		if (app.getTableName() == "sys_store_app" &&
			app.active == true &&
			app.isValidField("assigned_build_version") &&
			update[update.relevant_version].hasOwnProperty("build_version") &&
			update[update.relevant_version].build_version
		) {
			// Set assigned_build_version to the build_version from Store.
			app.setValue("assigned_build_version", update[update.relevant_version].build_version);
		}
		app.update();
		this._registerDbUpdates(app.getUniqueValue());
	},

	_createRemoteApp: /*gliderecord*/ function(/*{sys_id,name,scope,version,description}*/ update) {
		gs.info("Creating sys_remote_app for: {0}", this.json.encode(update));
		var gr = new GlideRecord("sys_remote_app");
		gr.initialize();

		if (update.hasOwnProperty("source_app_id") && update.source_app_id) {
			gr.setValue("source_app_id", update.source_app_id);
			gr.setNewGuidValue(update.source_app_id);

			if (!update[update.latest_version]) {
				update[update.latest_version] = this._getAppVersionDetails(update.source_app_id, update.latest_version);
			}
		}

		gr.setValue("name", update.app_name);
		gr.setValue("scope", update.scope);
		gr.setValue("latest_version", update.latest_version || update.relevant_version);
		gr.setValue("vendor", update.vendor);
		if(update[update.latest_version].short_description)
			gr.setValue("short_description", update[update.latest_version].short_description);
		gr.setValue("dependencies", update[update.latest_version].dependencies);
		gr.setValue("compatibilities", update[update.latest_version].compatibilities);
		gr.setValue("is_store_app", update[update.latest_version].is_store_app);
		gr.setValue("block_install", update[update.latest_version].block_install);
		gr.setValue("block_message", update[update.latest_version].block_message);
		gr.setValue("is_offline_app",update.is_offline_app);
		gr.setValue("needs_app_engine_licensing", update[update.latest_version].needs_app_engine_licensing);
		gr.setValue("custom_table_count", update[update.latest_version].custom_table_count);

		if (gr.isValidField('auto_update'))
			gr.setValue("auto_update", update.auto_update);

		if (update[update.latest_version].has_demo_data == "true")
			gr.setValue("demo_data", "has_demo_data");
		else
			gr.setValue("demo_data", "no_demo_data");

		if (gr.isValidField('publish_date'))
			gr.setValue("publish_date", update[update.latest_version].publish_date);
		if(gr.isValidField("sys_code"))
			gr.setValue("sys_code",update.sys_code);
		gr.setValue("uninstall_blocked",update.uninstall_blocked);
		gr.setValue("hide_on_ui",update.hide_on_ui);
		gr.setValue("installed_as_dependency", update.installed_as_dependency);
		if (gr.isValidField("sn_managed"))
			gr.setValue("sn_managed", update.hasOwnProperty("sn_managed") ? update.sn_managed : false);
		gr.setValue("contains_plugins", update[update.relevant_version].is_jumbo);
		if(!this.isInstanceOffline)
			gr.setValue("logo", update[update.relevant_version]["logo_sys_id"]);
		gr.insert();
		this._registerDbUpdates(gr.getUniqueValue());
		return gr;
	},

	_createCustomization: /*gliderecord*/ function(update) {
		gs.info("Creating sys_app_customization for: {0}", this.json.encode(update));
		var gr = new GlideRecord("sys_app_customization");
		gr.initialize();

		if (update.hasOwnProperty("source_customization_id") && update.source_customization_id)
			gr.setNewGuidValue(update.source_customization_id);

		gr.setValue("version", "none");
		gr.setValue("vendor_app", update.app_id);
		gr.setValue("latest_version", update.latest_version);

		gr.insert();
		var vendorApp = this._getApp(update.app_id);
		if(vendorApp != null) {
			vendorApp.setValue("customization", gr.getValue("sys_id"));
			if(vendorApp.getRecordClassName() == "sys_store_app")
					vendorApp.setValue("update_available", true);
			vendorApp.update();
		}
		return gr;
	},

	_constructConnectMessage: function(filters, linkText, count) {
		var filterString = '';
		var lengthOfFilters = filters.length -1;
		for(var filterCategory = 0;  filterCategory < filters.length; filterCategory++){
			filterString += filters[filterCategory].category + "=" + filters[filterCategory].id;
			if(filterCategory <  filters.length -1)
				filterString += "^";
		}

                return "[code]<a href='/nav_to.do?uri=/$allappsmgmt.do?sysparm_filter=" + filterString + "'>" + linkText + "<a>[/code]" + " (" + count + ")\n";
	},

	//Send connect chat messages to all admin users only
	_sendPushNotification: function() {
		var groupName = this.NOTIFICATION_GROUP_NAME;
		var groupGr = new GlideRecord("live_group_profile");
		groupGr.addQuery("name", groupName);
		groupGr.query();
		if (!groupGr.next()) {
			groupGr.setValue("name", groupName);
			groupGr.setValue("public_group", false);
			groupGr.setValue("visible_group", false);
			groupGr.setValue("type", "connect");
			groupGr.insert();
		}
		var collaborationManager = sn_connect.Conversation.get(groupGr.sys_id);
		var users = new GlideRecord('sys_user_has_role');
		users.addQuery('role', '2831a114c611228501d4ea6c309d626d');
		users.addQuery('user.active', true);
		users.query();
		while (users.next()) {
			collaborationManager.addSubscriber(users.user, true);
		}

		var connectMessage = gs.getMessage("Below store apps require attention:") + "\n";

		Object.keys(this.appNotificationConfig).forEach(function(item){
			if(this.appNotificationConfig[item]["count"] > 0)
				connectMessage += this._constructConnectMessage(this.appNotificationConfig[item]["filter"], this.appNotificationConfig[item]["linkText"], this.appNotificationConfig[item]["count"]);
		},this);

		collaborationManager.sendMessage(connectMessage);
	},

	_checkIndicatorsCountForInstalledAppsWithNoStoreData: function(updatesMap) {
		var app = new GlideRecord('sys_store_app');
		app.addActiveQuery();
		app.addNotNullQuery('version');
		app.addQuery("sys_id", "NOT IN", updatesMap);
		app.addQuery("indicators", "CONTAINS", "trial_deactivation_requested");
		app.query();
                var rowCountForDeactivatedApps = app.getRowCount();
		this.appNotificationConfig["appDeactivationRequests"]["count"] += rowCountForDeactivatedApps;

		var gr = new GlideRecord('sys_store_app');
		gr.addActiveQuery();
		gr.addNotNullQuery('version');
		gr.addQuery("sys_id", "NOT IN", updatesMap);
		gr.addQuery("indicators", "CONTAINS", "entitlement_revoked");
		gr.query();
                var rowCountForEntRevokedApps = app.getRowCount();
		this.appNotificationConfig["appEntitlementRevoked"]["count"] += rowCountForEntRevokedApps;
	},

	_checkAndUpdatePushNotificationCount: function(versionObject, parentAppObject, notificationTracker) {
		if(versionObject.indicators) {
			for(var i = 0; i < versionObject.indicators.length; i++) {
				if(versionObject.indicators[i].id == this.ENTITLEMENT_REVOKED)
					this.appNotificationConfig["appEntitlementRevoked"]["count"]++;
				if(versionObject.indicators[i].id == this.TRIAL_DEACTIVATION_REQUESTED)
					this.appNotificationConfig["appDeactivationRequests"]["count"]++;
			}
		}
		if((parentAppObject.getRecordClassName() == "sys_store_app") && this.versionComparator.isUpgrade(parentAppObject.getValue("version"), versionObject.version) && !notificationTracker.isUpdateAvailableChecked) {
			this.appNotificationConfig["appAvailableForUpdate"]["count"]++;
			notificationTracker.isUpdateAvailableChecked = true;
		}

		if(parentAppObject.getRecordClassName() == "sys_remote_app" && parentAppObject.shared_internally == false && !notificationTracker.isInstallationAvailableChecked) {
			this.appNotificationConfig["appAvailableForInstall"]["count"]++;
			notificationTracker.isInstallationAvailableChecked = true;
		}
	},

	_refreshVersions : /*void*/ function(/*GlideRecord sys_store_app | sys_remote_app */app, /*{}*/ update) {
		//update is the app object which has all the version info
		var appField = (app.getRecordClassName() == "sys_store_app")  ? "store_application" : "remote_application";
		var gr = new GlideRecord("sys_app_version");
		gr.addQuery("source_app_id", update.source_app_id);
		gr.query();

		while(gr.next()) {
			if (app.isValidField("version") && !this.versionComparator.isUpgrade(app.getValue("version"), gr.getValue("version"))) {
				gs.info("Deleting unneeded app version {0} for app {1}", gr.getValue("version"), app.getValue("sys_id"));
				this._registerDbUpdates(gr.source_app_id.toString());
				gr.deleteRecord();
			}
		}

		var notificationUpdateTracker = {
			isUpdateAvailableChecked : false,
			isInstallationAvailableChecked : false
		};

		//run through and create new records or update existing ones
		for (var prop in update) {
			if(gs.nil(update[prop]) || gs.nil(update[prop].version)) continue;

			//we should only store those which are an upgrade
			version = update[prop];
			gs.debug("Saving or updating sys_app_version record for {0} : {1} ({2})", app.getValue("name"), version.version, app.getValue("sys_id"));
			if (app.isValidField("version") && !this.versionComparator.isUpgrade(app.getValue("version"), version.version))
				continue;
			if(this.canSendNotification)
				this._checkAndUpdatePushNotificationCount(version, app, notificationUpdateTracker);
			gr.initialize();
			gr.addQuery("source_app_id", app.getValue("sys_id"));
			gr.addQuery("version", version.version);
			gr.query();

			if (!gr.next())
				gr.newRecord();

			gr.setValue(appField, app.getValue("sys_id"));
			gr.setValue("source_app_id", update.source_app_id);
			gr.setValue("name", update.app_name);
			gr.setValue("title", version.title);
			gr.setValue("number", version.app_number);
			gr.setValue("scope", update.scope);
			gr.setValue("version", version.version);
			gr.setValue("vendor", update.vendor);
			gr.setValue("vendor_key",update.vendor_key);
			if(version.short_description)
				gr.setValue("short_description", version.short_description);
			gr.setValue("dependencies", version.dependencies);
            gr.setValue("compatibilities", version.compatibilities);
            gr.setValue("is_store_app", version.is_store_app);
            gr.setValue("price_type", version.price_type ? version.price_type : "");
            gr.setValue("lob", (JSON.stringify(version.lob) || '[]'));
            gr.setValue("indicators", (JSON.stringify(version.indicators) || '[]'));
            gr.setValue("display_message", version.display_message ? version.display_message : "");
            gr.setValue("publish_date", version.publish_date);
            gr.setValue("auto_update", update.auto_update);
            gr.setValue("upload_info", version.upload_info ? version.upload_info : "");
            gr.setValue("custom_table_count", version.custom_table_count);
            gr.setValue("needs_app_engine_licensing", version.needs_app_engine_licensing);
			if(gr.isValidField('delivery_source'))
				if(version.delivery_source)
					gr.setValue('delivery_source',version.delivery_source);
				else
					gr.setValue('delivery_source','store');
            if (gr.isValidField('block_install'))
              gr.setValue("block_install", version.block_install);

            if (gr.isValidField('block_message'))
              gr.setValue("block_message", version.block_message);

			if (version.has_demo_data == "true")
				gr.setValue("demo_data", "has_demo_data");
			else
				gr.setValue("demo_data", "no_demo_data");
			gr.setValue("uninstall_blocked", version.uninstall_blocked);
			gr.setValue("hide_on_ui", version.hide_on_ui);
			gr.setValue("installed_as_dependency", version.installed_as_dependency);
			gr.setValue("store_latest_updated_time", version.store_latest_updated_time);
			gr.setValue("repo_latest_updated_time", version.repo_latest_updated_time);
			gr.setValue("logo", version.logo_sys_id);
			gr.setValue("contains_plugins", version.is_jumbo);
			if (gr.isValidField("build_version") && version.hasOwnProperty("build_version") && version.build_version) {
				gr.setValue("build_version", version.build_version);
			}
			if (gr.isNewRecord())
				gr.insert();
			else
				gr.update();
			if (version.is_jumbo && this.jumboCatalog.length > 0) {
				var jumboApp = this.jumboCatalog[this.jumboCatalog.length - 1];
				if ( jumboApp &&  jumboApp.source_app_id == app.getValue("sys_id")) {
					if(jumboApp.versions.indexOf(version.version) == -1)
						jumboApp.versions.push(version.version);
				}
			}

			this._registerDbUpdates(gr.source_app_id.toString());
		}
	},

	_refreshCustomizationVersions : /*void*/ function(/* GlideRecord sys_app_customization */ customization, /*{}*/ update) {
		// Update is the customization object which has all the version info
		var gr = new GlideRecord("sys_app_customization_version");
		gr.addQuery("app_customization", update.source_customization_id);
		gr.query();

		while (gr.next()) {
			if (customization.isValidField("version") && !this.versionComparator.isUpgrade(customization.getValue("version"), gr.getValue("version"))) {
				gs.info("Deleting unneeded Customization version {0} for app {1}", gr.getValue("version"), update.app_id);
				this._registerDbUpdates(gr.app_customization.vendor_app);
				gr.deleteRecord();
			}
		}

		// Run through and create new records or update existing ones
		for (var prop in update) {
			if (gs.nil(update[prop]) || gs.nil(update[prop].customization_version)) continue;

			// We should only store those which are an upgrade
			version = update[prop];
			gs.debug("Saving or updating sys_app_customization_version record for {0} : {1} ({2})", update.app_id, version.customization_version, update.source_customization_id);
			if (customization.isValidField("version") && !this.versionComparator.isUpgrade(customization.getValue("version"), version.customization_version))
				continue;
			gr.initialize();
			gr.addQuery("app_customization", update.source_customization_id);
			gr.addQuery("version", version.customization_version);
			gr.query();

			if (!gr.next())
				gr.newRecord();

			gr.setValue("app_customization", update.source_customization_id);
			gr.setValue("version", version.customization_version);
			gr.setValue("vendor_version", version.base_app_version);
			gr.setValue("vendor_app_id", update.app_id);
			gr.setValue("scope", version.base_app_scope);
			gr.setValue("war_version", version.war_version);

			if (gr.isNewRecord())
				gr.insert();
			else
				gr.update();

			this._registerDbUpdates(gr.app_customization.vendor_app);
		}
	},

	_getApp: /*GlideRecord sys_store_app | sys_remote_app */ function(/*string*/ sys_id) {
		var gr = new GlideRecord("sys_store_app");
        gr.addActiveQuery();
		gr.addQuery("sys_id", sys_id);
		gr.query();
		if (gr.next())
			return gr;

		gr = new GlideRecord("sys_remote_app");
		gr.addQuery("sys_id", sys_id);
		gr.query();
		if (gr.next())
			return gr;

		return null;
	},

	_getCustomization: /*GlideRecord sys_app_customization */ function(/*string*/ sys_id) {
		var gr = new GlideRecord("sys_app_customization");
		gr.get(sys_id);
		if (gr.isValidRecord())
			return gr;

		return null;
	},

	_removeWithdrawnAppVersions: function(updatesMap) {
		var app_version = new GlideRecord("sys_app_version");
		if (this.appChecksumsCacheEnabled) {
			app_version.addQuery("source_app_id", "NOT IN", this.appsFilteredByChecksum);
		}
		app_version.query();

        while (app_version.next()) {
            var appId = app_version.getValue("source_app_id");
            var currentVersion = app_version.getValue("version");

            if (gs.nil(updatesMap[appId]) || gs.nil(updatesMap[appId][currentVersion])) {
                gs.debug("Deleting sys_app_version record {0} : {1} ({2}) because it is not in the updates sent from the store.",
                    app_version.getValue("name"), currentVersion, app_version.getValue("number"));
				this._registerDbUpdates(app_version.source_app_id);
                app_version.deleteRecord();
				this._removeInaccessibleJumboApps(appId, currentVersion);
            }
        }

	},

	_removeWithdrawnCustomizationVersions: function(customizationMap) {
		var customization = new GlideRecord("sys_app_customization_version");
		if (this.appChecksumsCacheEnabled) {
			customization.addQuery("vendor_app_id", "NOT IN", this.appsFilteredByChecksum);
		}
		customization.query();

        while (customization.next()) {
            var appId = customization.getValue("vendor_app_id");
            var currentVersion = customization.getValue("version");

            if (gs.nil(customizationMap[appId]) || gs.nil(customizationMap[appId][currentVersion])) {
                gs.debug("Deleting sys_app_customization_version record {0} : {1} ({2}) because it is not in the updates sent from the store.",
                    customization.getValue("scope"), currentVersion, customization.getValue("vendor_app_id"));
				this._registerDbUpdates(customization.app_customization.vendor_app);
                customization.deleteRecord();
            }
        }
	},

	/**

* Description: queries on sys_offline_app table and data massaging will be done to mimic the store payload
* Returns: updates(offline apps from sys_offline_app table)
*/
	_getOfflineUpdates : function(){
		var updates = [];
		var offlineAppsJson = this._buildOfflineApps();
		var isVersionExists = false;
		for (var key in offlineAppsJson)
			updates.push(offlineAppsJson[key]);
		gs.debug("Got ({0}) candidate updates: {1}", updates.length, this.json.encode(updates));

		CommonUtils.setSystemProperty("sn_appclient.apps_last_sync_time", "value", new GlideDateTime());

		return {
			opstatus : 1,
			data : updates
		};
	},

	_buildOfflineApps : function(){
		var offlineApps = {};
		var scopename;
		var offlineAppsGr = new GlideRecord("sys_offline_app");
		offlineAppsGr.query();
		while(offlineAppsGr.next()){
			scopename = offlineAppsGr.getValue('scope');
			if(!offlineApps.hasOwnProperty(scopename)){
				offlineApps[scopename] = {};
				offlineApps[scopename]['scope'] = offlineAppsGr.getValue('scope');
				offlineApps[scopename]['app_name'] = offlineAppsGr.getValue('name');
				offlineApps[scopename]['source_app_id'] = offlineAppsGr.getValue('source_app_id');
				offlineApps[scopename]['vendor'] = offlineAppsGr.getValue('vendor');
				offlineApps[scopename]['vendor_key'] = offlineAppsGr.getValue('vendor_prefix');
				offlineApps[scopename]['auto_update'] = false;
				offlineApps[scopename]['shared_internally'] = false;
				offlineApps[scopename]['latest_version'] = offlineAppsGr.getValue('latest_version');
				offlineApps[scopename]['is_store_app'] =	true;
				offlineApps[scopename]['indicators'] = new global.JSON().decode(offlineAppsGr.getValue("indicators")) ? new global.JSON().decode(offlineAppsGr.getValue("indicators")) : [];
				offlineApps[scopename]['display_message'] = offlineAppsGr.getValue('display_message') || "";
				offlineApps[scopename]['sys_code'] = offlineAppsGr.getValue('sys_code');
				offlineApps[scopename]['products'] = JSON.parse(offlineAppsGr.getValue('products') || "[]");
				if(offlineAppsGr.isValidField('uninstall_blocked'))
					offlineApps[scopename]['uninstall_blocked'] = offlineAppsGr.uninstall_blocked.toString() == 'true'? true: false;
				if(offlineAppsGr.isValidField('hide_on_ui'))
					offlineApps[scopename]['hide_on_ui'] = offlineAppsGr.hide_on_ui.toString() == "true" ? true : false;
				if(offlineAppsGr.isValidField('installed_as_dependency'))
					offlineApps[scopename]['installed_as_dependency'] = offlineAppsGr.installed_as_dependency.toString() == "true" ? true : false;
				offlineApps[scopename]['needs_app_engine_licensing'] = offlineAppsGr.needs_app_engine_licensing ? true : false;
				offlineApps[scopename]['custom_table_count'] = offlineAppsGr.getValue("custom_table_count");

				var deliverySource = offlineAppsGr.getValue('delivery_source') ? offlineAppsGr.getValue('delivery_source').toLowerCase() : '';
				offlineApps[scopename]['latest_offline_version'] = deliverySource === 'offline' ? offlineAppsGr.getValue('latest_version') : '';
			}
			this._addOrCreateVersionForOfflineApp(offlineApps,scopename,offlineAppsGr);
		}
		return offlineApps;
	},

	_isOfflineAppBlockInstall: function(offlineAppsGr, compatibilities, scope){
		if (gs.getProperty("sn_appclient.disable_compatibility_check") == "true")
			return false;
		return (offlineAppsGr.getValue("delivery_source") == "offline") ?
			(compatibilities && compatibilities.toLowerCase().replace(this.spaceRegex,"").split(",").indexOf(this.buildName) == -1) : false;
	},

	_addOrCreateVersionForOfflineApp : function(offlineAppsJson,scope,offlineAppsGr){

		if(!offlineAppsJson[scope].hasOwnProperty('versions')){
			// add version of the new entry to existing version because there is another entry with different version in offline app
			offlineAppsJson[scope]['versions'] = [];
		}

       //stamp latestversion of offlineapp with current identified version if its latest
		if(offlineAppsJson[scope]['latest_version'] != offlineAppsGr.getValue('latest_version')){
				if(this.versionComparator.isUpgrade(offlineAppsJson[scope]['latest_version'],offlineAppsGr.getValue('latest_version'))){

					offlineAppsJson[scope]['latest_version'] = offlineAppsGr.getValue('latest_version');
				}
		}
		var deliverySource = offlineAppsGr.getValue('delivery_source') ? offlineAppsGr.getValue('delivery_source').toLowerCase() : '';
		if (deliverySource === 'offline') {
			var latestOfflineVersion = offlineAppsJson[scope]['latest_offline_version'];
			if (!latestOfflineVersion || this.versionComparator.isUpgrade(latestOfflineVersion, offlineAppsGr.getValue('latest_version'))) {
				offlineAppsJson[scope]['latest_offline_version'] = offlineAppsGr.getValue('latest_version');
				offlineAppsJson[scope]['products'] = JSON.parse(offlineAppsGr.getValue('products') || '[]');
			}
		}
                var offlineCompatibility = {};
                if(this._isOfflineAppBlockInstall(offlineAppsGr, offlineAppsGr.getValue("compatibilities"), scope)){
                        offlineCompatibility.block_install = true;
                        offlineCompatibility.block_message = this.notCertifiedAppBlockMessage;
                        offlineCompatibility.indicators = this.notCertifiedAppIndicator;
                }
		offlineAppsJson[scope]['versions'].push({
			'short_description' : offlineAppsGr.getValue("short_description"),
			'key_features' : offlineAppsGr.getValue("key_features"),
			'has_demo_data' : (offlineAppsGr.getValue("demo_data") == 'has_demo_data')? "true" : "false",
			'is_store_app' : true,
			'title' :  offlineAppsGr.getValue("name"),
			'release_notes' :offlineAppsGr.getValue("release_notes"),
			'version': offlineAppsGr.getValue("latest_version"),
			'compatibilities': offlineAppsGr.getValue("compatibilities"),
			'auto_update':false,
			'dependencies': offlineAppsGr.getValue("dependencies")? offlineAppsGr.getValue("dependencies") : '',
			'publish_date' : offlineAppsGr.getValue("publish_date"),
			'price_type' : offlineAppsGr.getValue("price_type"),
			'indicators': new global.JSON().decode(offlineAppsGr.getValue("indicators")) ? new global.JSON().decode(offlineAppsGr.getValue("indicators")) : (offlineCompatibility.indicators ? offlineCompatibility.indicators : []),
			'display_message': offlineAppsGr.getValue('display_message') || "",
			'delivery_source': offlineAppsGr.getValue('delivery_source'),
			'lob' : new global.JSON().decode(offlineAppsGr.getValue("lob")) ? new global.JSON().decode(offlineAppsGr.getValue("lob")) : [],
			'uninstall_blocked' : (offlineAppsGr.isValidField('uninstall_blocked') && offlineAppsGr.uninstall_blocked.toString() == 'true') ? true: false,
			'hide_on_ui' : (offlineAppsGr.isValidField('hide_on_ui') && offlineAppsGr.hide_on_ui.toString() == "true") ? true : false,
			'installed_as_dependency' : (offlineAppsGr.isValidField('installed_as_dependency') && offlineAppsGr.installed_as_dependency.toString() == "true") ? true : false,
			'needs_app_engine_licensing': offlineAppsGr.needs_app_engine_licensing ? true : false,
			'custom_table_count': offlineAppsGr.getValue("custom_table_count"),
			'lob' : new global.JSON().decode(offlineAppsGr.getValue("lob")) ? new global.JSON().decode(offlineAppsGr.getValue("lob")) : [],
			'block_install' : offlineCompatibility.block_install ? true : false,
			'block_message' : offlineCompatibility.block_message ? offlineCompatibility.block_message : "",
			'logo_hash': this._getLogoHashForOfflineApp(offlineAppsGr.logo),
			'is_jumbo': offlineAppsGr.getValue("contains_plugins") == '1'
		});

	},

        _getLogoHashForOfflineApp: function(logoSysId) {
        	if (!logoSysId)
            		return this.constants.NO_LOGO_EXIST;
        	var logoAttachment = new GlideRecord("sys_attachment");
        	logoAttachment.get(logoSysId);
		return logoAttachment.getValue("hash");
        },

	_deleteAllVersions: function (/*string*/ appId) {
		gs.debug("Deleting all app versions for source app {0}", appId);
		var app_versions = new GlideRecord("sys_app_version");
		app_versions.addQuery("source_app_id", appId);
		app_versions.query();

		gs.debug("Number of version records to delete: {0}", app_versions.getRowCount());
		this._registerDbUpdates(appId);
		app_versions.deleteMultiple();
		if (this.appChecksumsCacheEnabled) {
			this._removeAppFromChecksumsMap(appId);
		}
	},

	_deleteHigherVersions: function (/*string*/ appId,/*string*/ highestPossibleVersion) {
		if (!highestPossibleVersion)
			return;

		gs.debug("Deleting app versions for appId {0} higher than {1}", appId, highestPossibleVersion);

		var app_versions = new GlideRecord("sys_app_version");
		app_versions.addQuery("source_app_id",appId);
		app_versions.query();

		while (app_versions.next()) {
			if (this.versionComparator.isUpgrade(highestPossibleVersion, app_versions.getValue("version"))) {
				gs.debug("Deleting sys_app_version record for {0} version {1} because it is higher than the newest version ({2})",
						 app_versions.getValue("name"), app_versions.getValue("version"), highestPossibleVersion);
				this._registerDbUpdates(appVersiongr.source_app_id);

				app_versions.deleteRecord();
			}
		}
	},

	_versionArrayContains : /*boolean*/ function(/*[{}]*/ versionArray,/*string*/ appId) {
		for (var i = 0; i< versionArray.length; i++) {
			var newestVersion = versionArray[i];
			if (newestVersion.source_app_id == appId)
				return true;
		}
		return false;
	},

	_versionArrayContainsVersion: /*boolean*/ function( /*[{}]*/ versionArray,/*string*/ appId,/*string*/ version) {
		for (var i = 0; i< versionArray.length; i++) {
			var versionData = versionArray[i];
			if (versionData.source_app_id == appId && versionData.version == version)
				return true;
		}
		return false;
	},

	_setRelevantVersion: function(update, app) {
		if(!update.hasOwnProperty("latest_version") || gs.nil(update.latest_version))
			update.latest_version = this._getLatestVersionForUpdate(update);

		var isAppInstalled = app && app.getRecordClassName() == "sys_store_app";
		update.relevant_version  = (isAppInstalled && !gs.nil(update[app.getValue("version")])) ? app.getValue("version") : update.latest_version;

		if(!update[update.relevant_version]) {
			update[update.relevant_version] = this._getAppVersionDetails(update.source_app_id, update.relevant_version);
		}
	},

	_getLatestVersionForUpdate: function(update) {
		var versionList = [];
		for(var prop in update) {
			if(!gs.nil(update[prop]) && !gs.nil(update[prop].version))
				versionList.push(update[prop].version);
		}
		return new VersionComparator().getLatestVersion(versionList);
	},

	_getLatestVersionForCustomization: function(update) {
		if (!update.hasOwnProperty("latest_version") || gs.nil(update.latest_version)) {
          var versionList = [];
          for (var prop in update) {
              if (!gs.nil(update[prop]) && !gs.nil(update[prop].customization_version))
                  versionList.push(update[prop].customization_version);
          }

          update.latest_version = new VersionComparator().getLatestVersion(versionList);
		}
	},

	_getHighestVersionNumber: /*{}*/ function(/*string*/ appId, /*[{}]*/ highestVersions) {
		for (var i = 0; i< highestVersions.length; i++) {
			var newestVersion = highestVersions[i];
			if (newestVersion.source_app_id == appId)
				return newestVersion.version;
		}
		gs.debug("No versions found for {1}", appId);
		return false;
	},

	_areEqual: /*Boolean*/ function(a, b) {
		if (gs.nil(a) && gs.nil(b))
			return true;

		return (a+'') == (b+'');
	},

	_areEqualBoolean: /*Boolean*/ function(a, b) {
		if (gs.nil(a) && gs.nil(b))
			return true;

		a = gs.nil(a) ? "false" : a+'';
		if (a == "true")
			a = "1";
		else if (a+'' == "false")
			a = "0";

		b = gs.nil(b) ? "false" : b+'';
		if (b == "true")
			b = "1";
		else if (b == "false")
			b = "0";

		return a == b;
	},

	_getAppVersionDetails: function(sourceAppId, version) {
        return this._getInstalledAppVersion(sourceAppId, version) || this._getSysAppVersion(sourceAppId, version) || {};
	},

	_getInstalledAppVersion: function(sourceAppId, version) {
		var storeAppGr = new GlideRecord("sys_store_app");
		storeAppGr.addQuery("sys_id", sourceAppId);
		storeAppGr.addQuery("active", true);
		storeAppGr.addQuery("version", version);
		storeAppGr.query();

		return this._getVersionObject(storeAppGr);
	},

	_getSysAppVersion: function(sourceAppId, version) {
		var appVersionGr = new GlideRecord("sys_app_version");
		appVersionGr.addQuery("source_app_id", sourceAppId);
		appVersionGr.addQuery("version", version);
		appVersionGr.query();

		return this._getVersionObject(appVersionGr);
	},

	_getVersionObject: function(/*GlideRecord sys_app_version or sys_store_app*/gr) {
		var appVersionObj;

		if (gr.next()) {
			appVersionObj = {};
			appVersionObj.auto_update = gr.auto_update + "";
			appVersionObj.source_app_id = (gr.getTableName() == "sys_app_version" ? gr.source_app_id : gr.sys_id)+"";
			appVersionObj.version = gr.version + "";
			appVersionObj.compatibilities = gr.compatibilities + "";
			appVersionObj.custom_table_count = (gr.custom_table_count || 0) + "";
			appVersionObj.dependencies = gr.dependencies + "";
			appVersionObj.has_demo_data = (gr.demo_data == "has_demo_data") + "";
			appVersionObj.hide_on_ui = gr.hide_on_ui.toString() == "true";
			appVersionObj.indicators = (gs.nil(gr.indicators) || gr.indicators == "undefined") ? [] : JSON.parse(gr.getValue("indicators"));
			appVersionObj.installed_as_dependency = gr.installed_as_dependency.toString() == "true";
			appVersionObj.is_store_app = gr.is_store_app.toString() == "true";
			appVersionObj.lob = (gs.nil(gr.lob) || gr.lob == "undefined") ? [] : JSON.parse(gr.getValue("lob"));
			appVersionObj.needs_app_engine_licensing = gr.needs_app_engine_licensing.toString() == "true";
			appVersionObj.price_type = gr.price_type + "";
			appVersionObj.short_description = gr.short_description + "";
			appVersionObj.store_latest_updated_time = gr.store_latest_updated_time + "";
			appVersionObj.repo_latest_updated_time = gr.repo_latest_updated_time + "";
			appVersionObj.title = (gr.getTableName() == "sys_app_version" ? gr.title : gr.name) + "";
			appVersionObj.uninstall_blocked = gr.uninstall_blocked.toString() == "true";
			if(gr.isValidField("number"))
				appVersionObj.app_number = gr.number + "";
			if(gr.isValidField("block_install"))
				appVersionObj.block_install = gr.block_install.toString() == "true";
			if(gr.isValidField("block_message"))
				appVersionObj.block_message = gr.block_message + "";
			if(gr.isValidField("publish_date"))
				appVersionObj.publish_date = gr.publish_date + "";
			if(gr.isValidField("display_message"))
				appVersionObj.display_message = gr.display_message + "";
			if(gr.isValidField("upload_info"))
				appVersionObj.upload_info = gr.upload_info + "";
			if(gr.isValidField("shared_internally"))
				appVersionObj.shared_internally = gr.shared_internally.toString() == "true";
		}

		gs.debug("appVersionObj: " + JSON.stringify(appVersionObj));
		return appVersionObj;
	},

	_getAllAppVersionSelectedProperties: function() {
		var properties = ["logo", "block_install", "block_message", "auto_update", "shared_internally", "store_latest_updated_time",
                         "repo_latest_updated_time", "indicators", "dependencies", "needs_app_engine_licensing", "store_application", "latest_version"];

		var appVersionMap = {};

		var gr = new GlideRecord("sys_app_version");
		gr.query();

		this._getPropertiesFromGlideRecord(gr, properties, appVersionMap);

		gr = new GlideRecord("sys_store_app");
		gr.addNotNullQuery("last_installed_from");
		gr.query();

		this._getPropertiesFromGlideRecord(gr, properties, appVersionMap);

		gs.info("appVersionMap:" + JSON.stringify(appVersionMap));
		return appVersionMap;
	},

	_getPropertiesFromGlideRecord: function(gr, properties, appVersionMap) {
		while (gr.next()) {
			var sourceAppId = gr.getTableName() == "sys_app_version" ? gr.source_app_id : gr.sys_id;
			if (!appVersionMap[sourceAppId]) appVersionMap[sourceAppId] = {};
			if (!appVersionMap[sourceAppId][gr.version]) appVersionMap[sourceAppId][gr.version] = {};

			if(gr.getTableName() == "sys_store_app") {
				if(!gr.active || !gr.version) {
					delete appVersionMap[sourceAppId];
					continue;
				}
				appVersionMap[sourceAppId].installed = true;
			}

			for (i in properties) {
				if (gr.isValidField(properties[i])) {
					var value = gr[properties[i]].toString();
					if (properties[i] == "indicators")
						value = (gs.nil(value) || value == "undefined") ? [] : JSON.parse(value);
					appVersionMap[sourceAppId][gr.version][properties[i]] = value;
				}
			}
		}
	},

	_processDeltaPayload: function(storePayload, args) {
		this._setAppsSyncProgress(0.06, 'addAppLevelPropertiesToVersionForFiltering');

		var allAppVersionSelectedProperties = this._getAllAppVersionSelectedProperties();

		// adding some app level properties to version, as filtering is done at version level in next step
		this._addAppLevelPropertiesToVersionForFiltering(storePayload);

		this._setAppsSyncProgress(0.08, 'getDeltaCustomizationMap');

		var customizationMap = this._getDeltaCustomizationMap(storePayload);

		this._setAppsSyncProgress(0.10, 'filterAppVersionsPresentOnInstance');

		// remove app versions present on instance
		this._filterAppVersionsPresentOnInstance(allAppVersionSelectedProperties, storePayload);

		this._setAppsSyncProgress(0.12, 'processAppVersionsNotPresentOnStore');

		// adding delete action for app versions not sent from store
		this._processAppVersionsNotPresentOnStore(allAppVersionSelectedProperties, storePayload);

		this._setAppsSyncProgress(0.14, 'removeAppsWithNoVersion');

		// remove app objects with no version
		this._removeAppsWithNoVersion(storePayload);

		gs.info("Processing ({0}) delta apps: {1}", storePayload.length, JSON.stringify(storePayload));

		this._setAppsSyncProgress(0.16, 'getUpdates');

		var updates = this._getUpdates(storePayload);
		if (!updates) return;

		this._setAppsSyncProgress(0.18, 'filterLocalApps');

		//remove apps where a local version exists
		this._filterLocalApps(updates.appMap);

		this._setAppsSyncProgress(0.20, 'updateAppRecords');

		//update app records in sys_store_app, sys_remote_app and sys_app_version tables
		this._updateAppRecords(updates.appMap);

		this._setAppsSyncProgress(0.70, 'updateCustomizations');

		// Update app records in sys_app_customization and sys_app_customization_version tables
		this._updateCustomizations(customizationMap);

		this._setAppsSyncProgress(0.80, 'downloadLogosAsync');

		// update logos async
		this._downloadLogosAsync();

		this._setAppsSyncProgress(0.90, 'populateJumboSpecificTables');

		this.populateJumboSpecificTables(this.jumboCatalog);
	},

	// adding some app level properties to version, as filtering is done at version level in next step
	_addAppLevelPropertiesToVersionForFiltering: function(apps) {
		var appProps = ["auto_update", "shared_internally", "latest_version"];
		apps.forEach(function(app) {
			if (app.versions) {
				app.versions.forEach(function(versionObj) {
					appProps.forEach(function(key) {
						versionObj[key] = app[key];
					});
					versionObj.logo = versionObj.logo_sys_id;
				});
			}
		});
	},

    _filterAppVersionsPresentOnInstance: function(allAppVersionSelectedProperties, apps) {
        apps.forEach(function(app) {
            if (app.versions) {
                app.versions = app.versions.filter(function(versionObj) {
                    if (!allAppVersionSelectedProperties[app.source_app_id] ||
                        !allAppVersionSelectedProperties[app.source_app_id][versionObj.version] ||
                        (allAppVersionSelectedProperties[app.source_app_id]["installed"] &&
                            allAppVersionSelectedProperties[app.source_app_id][versionObj.version].hasOwnProperty("store_application") &&
                            !allAppVersionSelectedProperties[app.source_app_id][versionObj.version]["store_application"])) {
                        return true;
                    }

                    var appVersionObjSelectedProperties = allAppVersionSelectedProperties[app.source_app_id][versionObj.version];
                    appVersionObjSelectedProperties.found = true;

                    for (var key in appVersionObjSelectedProperties) {
                        if (key == "found" || gs.nil(versionObj[key]))
                            continue;

                        var versionObjValue = key == "indicators" ? JSON.stringify(versionObj[key]) : versionObj[key].toString();
                        var selectedPropertyValue = key == "indicators" ? JSON.stringify(appVersionObjSelectedProperties[key]) : appVersionObjSelectedProperties[key].toString();
                        if (versionObjValue != selectedPropertyValue) {
                            gs.debug("Retaining app {0} version {1} as {2} has changed", app.app_name, versionObj.version, key);
                            return true;
                        }
                    }
                    return false;
                });
            }
        });
    },

    _processAppVersionsNotPresentOnStore: function(allAppVersionSelectedProperties, apps) {
		if(this.specificAppsToUpdate !== "[]")
			return;
        for (var appId in allAppVersionSelectedProperties) {
            for (var key in allAppVersionSelectedProperties[appId]) {
                if (key != "installed" && !allAppVersionSelectedProperties[appId][key].found) {

                    var appVersiongr = new GlideRecord("sys_app_version");
                    appVersiongr.addQuery("source_app_id", appId);
                    appVersiongr.addQuery("version", key);
                    appVersiongr.query();
                    if (appVersiongr.next()) {
						gs.info("Trying to delete: " + appId + " version: " + key);
						this._registerDbUpdates(appId);
                        appVersiongr.deleteRecord();
                    }

                    var remoteAppGr = new GlideRecord("sys_remote_app");
                    remoteAppGr.addQuery("source_app_id", appId);
                    remoteAppGr.addQuery("latest_version", key);
                    remoteAppGr.query();
                    if (remoteAppGr.next()) {
						gs.info("Trying to delete: " + appId + " version: " + key);
						this._registerDbUpdates(remoteAppGr.getUniqueValue());
                        remoteAppGr.deleteRecord();
                    }
                }
            }
        }
    },

    _removeAppsWithNoVersion: function(apps) {
        for (var i = 0; i < apps.length; i++) {
            if (apps[i] && !apps[i].versions) {
                apps.splice(i, 1);
                i--;
            }
        }
    },

	_getPluginActivationEnforcementMode: function() {
		if (typeof sn_lef.GlideEntitlement.getPluginActivationMode === "function")
			return sn_lef.GlideEntitlement.getPluginActivationMode();
		else
			return '';
	},

	_getIsInstanceLicenseAware: function() {
		if (typeof sn_lef.GlideEntitlement.getLicenseAwareMode === "function")
			return sn_lef.GlideEntitlement.getLicenseAwareMode();
		else
			return '';
	},

	_registerDbUpdates: function(sysId) {
		if(!gs.nil(sysId))
			this.appsUpdatedInDB[sysId] = true;
	},
	setInstanceOfflineProperty: function(value) {
		var instanceOfflineFlag = (value == true || value == "true");
		gs.setProperty("sn_appclient.app.install.offline", instanceOfflineFlag);
	},

    type: 'UpdateChecker'
};
