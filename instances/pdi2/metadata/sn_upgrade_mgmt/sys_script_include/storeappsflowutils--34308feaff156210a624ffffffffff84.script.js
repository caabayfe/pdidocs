var StoreAppsFlowUtils = Class.create();
StoreAppsFlowUtils.prototype = {
    initialize: function() {
		this.globalUmUtil = new global.UpgradeManagementApiUtil();
		this.versionComparator = new sn_appclient.VersionComparator(); 
    },
	/**
	 * Loads data from upgrade_preview_app table into a map by scope.
	 * This table stores all true-ups and new OOB apps post preview generation.
	 */
	_loadPreviewAppMap: function(grPreviewApp) {
		const map = {};

		while (grPreviewApp.next()) {
			const scope = grPreviewApp.getValue("scope");
			map[scope] = {
				true_up_version: grPreviewApp.getValue("oob_version"),
				scope: scope,
				current_version: grPreviewApp.getValue("from_version"),
				name: grPreviewApp.getValue("name"),
				action: grPreviewApp.getValue("action"),
				app_sys_id: grPreviewApp.getValue("app_sys_id"),
			};
		}

		return map;
	},
	/**
	 * Loads all sys_upgrade_plan_item records into a map by scope.
	 * This helps us track what version the user has already selected for upgrade.
	 */
	_loadPlanItemMap: function(grPlanItem) {
		const map = {};

		while (grPlanItem.next()) {
			const scope = grPlanItem.getValue("scope");
			map[scope] = {
				sys_id: grPlanItem.getValue("sys_id"),
				selected_version: grPlanItem.getValue("version"),
				selected_state: grPlanItem.getValue("state"),
				selected_status_message: grPlanItem.getValue("status_message")
			};
		}

		return map;
	},
	/**
	 * Adds an app entry to the upgradableApps map if a new version is available.
	 * This is driven by the sn_upgrade_mgmt_um_preview_app_store_page view,
	 * which joins incoming app/version and current store app details.
	 */
	_addToUpgradableApps: function(grView, upgradableApps, previewAppMap, planItemMap) {
		const appName = grView.getValue("currentstore_name");
		const scope = grView.getValue("currentstore_scope");
		const currentVersion = grView.getValue("currentstore_version");
		const latestVersion = grView.getValue("latest_latest_version");
		const incomingVersion = grView.getValue("incoming_version");
		const dependencies = grView.getValue("incoming_dependencies") || "";

		const previewInfo = previewAppMap[scope] ?? {};
		const planItemInfo = planItemMap[scope] ?? {};

		const sysCode = grView.getValue("currentstore_sys_id") ?? previewInfo.app_sys_id; // sysCode is actually sys_id in sys_store_app table

		const trueUpVersion = previewInfo.true_up_version ?? null;
		const selectedVersionInTable = planItemInfo.selected_version ?? null;
		const state = planItemInfo.selected_state ?? "";
		const statusMessage = planItemInfo.selected_status_message ?? "";

		const candidateVersion = trueUpVersion || currentVersion;
		const selectedVersion = selectedVersionInTable || candidateVersion;

		// if (incoming > candidate)
		if (
			this.versionComparator.isUpgrade(candidateVersion, incomingVersion) ||
			(candidateVersion !== currentVersion && candidateVersion === incomingVersion)
		) {
			if (upgradableApps[scope]) {
				upgradableApps[scope].upgradable_versions.push(incomingVersion);
			} else {
				upgradableApps[scope] = {
					app_name: appName,
					scope: scope,
					installed_version: currentVersion,
					latest_available_version: latestVersion,
					upgradable_versions: trueUpVersion ? [incomingVersion] : [currentVersion, incomingVersion],
					selected: selectedVersion,
					true_up_version: trueUpVersion,
					sys_code: sysCode,
					state: state,
					status_message: statusMessage,
					dependencies: dependencies
				};
			}
		}
	},
	/**
	 * Handles new OOB apps marked as "Installed" in the preview.
	 * These apps do not exist on the current instance but are recommended for installation.
	 * They are pulled from sn_upgrade_mgmt_um_preview_store_apps_action_installed view.
	 */
	_handleInstalledApps: function(grInstalledApp, upgradableApps, planItemMap) {
		while (grInstalledApp.next()) {
			const appName = grInstalledApp.getValue("preview_name");
			const scope = grInstalledApp.getValue("preview_scope");
			const currentVersion = "Not Installed";
			const trueUpVersion = grInstalledApp.getValue("preview_oob_version");
			const latestVersion = trueUpVersion;
			const incomingVersion = grInstalledApp.getValue("incoming_version");
			const sysCode = grInstalledApp.getValue("preview_app_sys_id") ?? grInstalledApp.getValue("incomingparent_source_app_id"); // source app id = sys_id of application
			const dependencies = grInstalledApp.getValue("incoming_dependencies") || "";

			// Use selected fields from planItemMap
			const planItemInfo = planItemMap[scope] ?? {};
			const selectedVersionInTable = planItemInfo.selected_version ?? null;
			const state = planItemInfo.selected_state ?? "";
			const statusMessage = planItemInfo.selected_status_message ?? "";

			const candidateVersion = trueUpVersion || currentVersion;
			const selectedVersion = selectedVersionInTable || candidateVersion;

			if (!upgradableApps[scope]) {
				upgradableApps[scope] = {
					app_name: appName,
					scope,
					installed_version: currentVersion,
					upgradable_versions: [trueUpVersion],
					selected: selectedVersion,
					latest_available_version: latestVersion,
					true_up_version: trueUpVersion,
					sys_code: sysCode,
					state,
					status_message: statusMessage,
					dependencies: dependencies
				};
			}

			if (incomingVersion && this.versionComparator.isUpgrade(candidateVersion, incomingVersion)) {
				if (upgradableApps[scope].installed_version !== "Not Installed") {
					gs.error("App showing as not installed in upgrade preview is found installed on the instance"); // Should never happen
				}

				upgradableApps[scope].upgradable_versions.push(incomingVersion);
				upgradableApps[scope].latest_available_version = incomingVersion;
			}
		}
	},
	/**
	 * Handle case when trueup versions do not exist in store - force app from previewAppTable.
	 * This scenario is mostly possible if get_all_available_apps fails or gives incomplete data
	 * (example: missing true up version). It is added as a failsafe since the store API had issues
	 * where it was not giving apps for the target release.
	 */
	_handleMissingStoreApps: function(previewAppMap, planItemMap, upgradableApps) {
		let currentStoreMap = {};
		let fetchedStoreApps = false;

		for (const [scope, previewApp] of Object.entries(previewAppMap)) {
			if (previewApp.action === "installed") continue;

			const trueUpVersion = previewApp.true_up_version;

			const planItem = planItemMap[scope] ?? {
				selected_version: trueUpVersion,
				selected_state: "",
				selected_status_message: ""
			};

			if (upgradableApps.hasOwnProperty(scope)) {
				const app = upgradableApps[scope];

				// Add true_up_version at the beginning if not already present
				if (!app.upgradable_versions.includes(trueUpVersion)) {
					app.upgradable_versions.unshift(trueUpVersion);
				}

				// Update latest_available_version if true_up_version > latest_available_version
				if (this.versionComparator.isUpgrade(app.latest_available_version, trueUpVersion)) {
					app.latest_available_version = trueUpVersion;
				}

				// Update selected, state, and status_message from planItemMap if present or to trueup
				app.selected = planItem.selected_version;
				app.state = planItem.selected_state;
				app.status_message = planItem.selected_status_message;
			} else {
				if (!fetchedStoreApps) {
					// Fetch only when necessary and fetch all apps only once
					const grCurrentStoreApps = new GlideRecord("sys_store_app");
					grCurrentStoreApps.query();
					while (grCurrentStoreApps.next()) {
						currentStoreMap[grCurrentStoreApps.getValue("scope")] = grCurrentStoreApps.getValue("sys_id");
					}
					fetchedStoreApps = true;
				}

				upgradableApps[scope] = {
					app_name: previewApp.name,
					scope,
					installed_version: previewApp.current_version,
					latest_available_version: trueUpVersion,
					upgradable_versions: [trueUpVersion],
					selected: planItem.selected_version,
					true_up_version: trueUpVersion,
					sys_code: previewApp.app_sys_id ?? currentStoreMap[scope] ?? "", // todo: we don't need currentStoreMap anymore since we have ID in preview table
					state: planItem.selected_state,
					status_message: planItem.selected_status_message
				};
			}
		}
	},

    _getAlreadyCheckedVersionInfo: function(upgradePlanSysId, upgradableApps){
        var grPlanSource = new GlideRecord("sys_upgrade_plan_source"); // All the true ups and new OOB apps are stored here after upgrade preview generation
		grPlanSource.addQuery("upgrade_plan", upgradePlanSysId); // Only fetching true ups for the preview generated for the target version
		grPlanSource.query();

        var alreadyCheckedVersionInfo = {};
        while (grPlanSource.next()) {
            alreadyCheckedVersionInfo[grPlanSource.getValue("scope")] = grPlanSource.getValue("version");
        }

		for(var scope in upgradableApps){
			upgradableApps[scope].already_checked_version = alreadyCheckedVersionInfo[scope];
		}
    },

	/**
	 * Gets available suite versions filtered by platform version, sorted descending.
	 * Reads from sn_um_incoming_suite_config table (synced from store).
	 * Filters to show only installed version and versions above it (no downgrades).
	 * @param {string} upgradeSessionId - Optional upgrade session ID
	 * @returns {Array} Suite version objects
	 */
	_getAvailableSuiteVersions: function(upgradeSessionId) {
		var targetPlatformVersion = null;
		if (upgradeSessionId) {
			var grSession = new GlideRecord("sn_um_upgrade_sessions");
			if (grSession.get(upgradeSessionId)) {
				targetPlatformVersion = grSession.getValue("target_platform_version");
			}
		}
		var grSuiteConfig = new GlideRecord("sn_um_incoming_suite_config");
		grSuiteConfig.addQuery("platform", targetPlatformVersion);
		grSuiteConfig.query();
		var suiteVersions = [];
		while (grSuiteConfig.next()) {
			suiteVersions.push({
				version: grSuiteConfig.getValue("version"),
				sys_id: grSuiteConfig.getValue("sys_id"),
				name: grSuiteConfig.getValue("name"),
				platform: grSuiteConfig.getValue("platform"),
				installed: false
			});
		}
		var self = this;
		suiteVersions.sort(function(a, b) {
			if (self.versionComparator.isUpgrade(a.version, b.version)) {
				return 1;
			}
			if (self.versionComparator.isUpgrade(b.version, a.version)) {
				return -1;
			}
			return 0;
		});
		
		// Filter to show only installed version and versions above it
		var installedVersion = this._getInstalledSuiteVersion();
		if (installedVersion) {
			suiteVersions = suiteVersions.filter(function(suite) {
				// Keep if it's the installed version or higher than installed version
				return suite.version === installedVersion.version || 
				       self.versionComparator.isUpgrade(installedVersion.version, suite.version);
			});
		}
		
		return suiteVersions;
	},
	
	/**
	 * Gets the installed suite version.
	 * @returns {Object|null} Suite version object or null
	 */
	_getInstalledSuiteVersion: function() {
		var grInstalledSuite = new GlideRecord("sys_suite_config");
		grInstalledSuite.addQuery("installed", true);
		grInstalledSuite.query();
		if (grInstalledSuite.next()) {
			var installedSuite = {
				version: grInstalledSuite.getValue("version"),
				sys_id: grInstalledSuite.getValue("sys_id"),
				name: grInstalledSuite.getValue("name"),
				platform: grInstalledSuite.getValue("platform"),
				installed: true
			};
			return installedSuite;
		}
		return null;
	},

	/**
	 * Gets the latest available suite version.
	 * @param {string} upgradeSessionId - Optional upgrade session ID
	 * @returns {Object} Latest suite version with version and sys_id
	 */
	_getLatestSuiteVersion: function(upgradeSessionId) {
		var availableVersions = this._getAvailableSuiteVersions(upgradeSessionId);
		if (availableVersions.length === 0) {
			return {
				version: null,
				sys_id: null
			};
		}
		return {
			version: availableVersions[0].version,
			sys_id: availableVersions[0].sys_id
		};
	},

	/**
	 * Loads suite config apps from incoming tables.
	 * Reads from sn_um_incoming_suite_config and sn_um_incoming_suite_config_app_version_m2m.
	 * @param {String} suiteConfigSysId - Suite config sys_id
	 * @param {String} suiteVersion - Suite version
	 * @returns {Object} Map of suite name -> suite version -> apps
	 */
	_loadSuiteConfigApps: function(suiteConfigSysId, suiteVersion) {
		var suiteAppsMap = {};
		if (suiteConfigSysId && suiteVersion) {
			var grM2M = new GlideRecord("sn_um_incoming_suite_config_app_version_m2m");
			grM2M.addQuery("suite_config", suiteConfigSysId);
			grM2M.query();
			var grSuite = new GlideRecord("sn_um_incoming_suite_config");
			if (grSuite.get(suiteConfigSysId)) {
				var suiteName = grSuite.getValue("name");
				if (!suiteAppsMap[suiteName]) {
					suiteAppsMap[suiteName] = {};
				}
				if (!suiteAppsMap[suiteName][suiteVersion]) {
					suiteAppsMap[suiteName][suiteVersion] = {};
				}
				while (grM2M.next()) {
					var appScope = grM2M.getValue("app_scope");
					var appVersion = grM2M.getValue("app_version");
					suiteAppsMap[suiteName][suiteVersion][appScope] = appVersion;
				}
			}
		} else {
			var grSuiteAll = new GlideRecord("sn_um_incoming_suite_config");
			grSuiteAll.addQuery("compatible", false);
			grSuiteAll.addQuery("installed", false);
			grSuiteAll.query();
			while (grSuiteAll.next()) {
				var suiteName = grSuiteAll.getValue("name");
				var version = grSuiteAll.getValue("version");
				var sysId = grSuiteAll.getValue("sys_id");
				if (!suiteAppsMap[suiteName]) {
					suiteAppsMap[suiteName] = {};
				}
				if (!suiteAppsMap[suiteName][version]) {
					suiteAppsMap[suiteName][version] = {};
				}
				var grM2M = new GlideRecord("sn_um_incoming_suite_config_app_version_m2m");
				grM2M.addQuery("suite_config", sysId);
				grM2M.query();
				while (grM2M.next()) {
					var appScope = grM2M.getValue("app_scope");
					var appVersion = grM2M.getValue("app_version");
					suiteAppsMap[suiteName][version][appScope] = appVersion;
				}
			}
		}
		return suiteAppsMap;
	},

	/**
	 * Splits apps into golden config and regular apps based on suite version.
	 * @param {Object} upgradableApps - Map of upgradable apps
	 * @param {String} upgradeSessionId - Optional upgrade session ID
	 * @param {String} selectedSuiteVersionParam - Optional suite version from UI
	 * @returns {Object} Object with goldenConfigApps, regularApps, and suite info
	 */
	_splitAppsIntoGoldenAndRegular: function(upgradableApps, upgradeSessionId, selectedSuiteVersionParam) {
		var result = {
			goldenConfigApps: {},
			regularApps: {}
		};
		var suiteVersions = this._getAvailableSuiteVersions(upgradeSessionId);
		if (suiteVersions.length === 0) {
			for (var scope in upgradableApps) {
				upgradableApps[scope].suite_version = null;
				result.regularApps[scope] = upgradableApps[scope];
			}
			return result;
		}
		var selectedSuiteVersion = null;
		var selectedSuiteSysId = null;
		var latestSuite = suiteVersions[0];
		var installedSuiteVersion = null;
		var installedSuiteSysId = null;
		var grInstalledSuite = new GlideRecord("sys_suite_config");
		grInstalledSuite.addQuery("installed", true);
		grInstalledSuite.query();
		if (grInstalledSuite.next()) {
			installedSuiteVersion = grInstalledSuite.getValue("version");
			installedSuiteSysId = grInstalledSuite.getValue("sys_id");
		}
		// Check if suite version is provided as parameter (from UI dropdown change)
		if (selectedSuiteVersionParam) {
			var foundSuite = null;
			for (var i = 0; i < suiteVersions.length; i++) {
				if (suiteVersions[i].version === selectedSuiteVersionParam) {
					foundSuite = suiteVersions[i];
					break;
				}
			}
			if (foundSuite) {
				selectedSuiteVersion = foundSuite.version;
				selectedSuiteSysId = foundSuite.sys_id;
			} else {
				selectedSuiteVersion = latestSuite.version;
				selectedSuiteSysId = latestSuite.sys_id;
			}
			// Save the selected version to config table
			if (upgradeSessionId) {
				this.setSelectedSuiteVersionInConfig(upgradeSessionId, selectedSuiteVersion);
			}
		} else {
			// Check if suite version is saved in config table
			var savedSuiteVersion = null;
			if (upgradeSessionId) {
				savedSuiteVersion = this.getSelectedSuiteVersionFromConfig(upgradeSessionId);
			}
			
			if (savedSuiteVersion) {
				// Use saved version from config
				var foundSavedSuite = null;
				for (var i = 0; i < suiteVersions.length; i++) {
					if (suiteVersions[i].version === savedSuiteVersion) {
						foundSavedSuite = suiteVersions[i];
						break;
					}
				}
				if (foundSavedSuite) {
					selectedSuiteVersion = foundSavedSuite.version;
					selectedSuiteSysId = foundSavedSuite.sys_id;
					gs.info("Using saved suite version from config: " + selectedSuiteVersion);
				} else {
					// Saved version not found in available versions, use latest
					selectedSuiteVersion = latestSuite.version;
					selectedSuiteSysId = latestSuite.sys_id;
					// Update config with latest version
					if (upgradeSessionId) {
						this.setSelectedSuiteVersionInConfig(upgradeSessionId, selectedSuiteVersion);
					}
				}
			} else {
				// No saved version, use latest and save it
				selectedSuiteVersion = latestSuite.version;
				selectedSuiteSysId = latestSuite.sys_id;
				if (upgradeSessionId) {
					this.setSelectedSuiteVersionInConfig(upgradeSessionId, selectedSuiteVersion);
					gs.info("No saved suite version found, using latest: " + selectedSuiteVersion);
				}
			}
		}
		var selectedSuiteAppsMap = this._loadSuiteConfigApps(selectedSuiteSysId, selectedSuiteVersion);
		var latestSuiteAppsMap = this._loadSuiteConfigApps(latestSuite.sys_id, latestSuite.version);
		for (var scope in upgradableApps) {
			var app = upgradableApps[scope];
			var isInSelectedSuite = false;
			var selectedSuiteAppVersion = null;
			var suiteName = null;
			for (var suite in selectedSuiteAppsMap) {
				for (var version in selectedSuiteAppsMap[suite]) {
					if (selectedSuiteAppsMap[suite][version][scope]) {
						isInSelectedSuite = true;
						selectedSuiteAppVersion = selectedSuiteAppsMap[suite][version][scope];
						suiteName = suite;
						app.suite_version = version;
						break;
					}
				}
				if (isInSelectedSuite) break;
			}
			if (isInSelectedSuite) {
				var latestSuiteAppVersion = null;
				for (var suite in latestSuiteAppsMap) {
					if (suite === suiteName) {
						for (var version in latestSuiteAppsMap[suite]) {
							if (latestSuiteAppsMap[suite][version][scope]) {
								latestSuiteAppVersion = latestSuiteAppsMap[suite][version][scope];
								break;
							}
						}
					}
					if (latestSuiteAppVersion) break;
				}
				if (latestSuiteAppVersion) {
					app.latest_available_version = latestSuiteAppVersion;
				}
				
				// Set selected version for golden config apps
				app.selected = selectedSuiteAppVersion;
				app.selected_suite = selectedSuiteAppVersion;
				
				var installedVersion = app.installed_version;
				if (installedVersion === "Not Installed") {
					app.state = "will_be_installed";
					result.goldenConfigApps[scope] = app;
				} else if (this.versionComparator.isUpgrade(installedVersion, selectedSuiteAppVersion)) {
					app.state = "will_be_updated";
					result.goldenConfigApps[scope] = app;
				} else {
					app.state = "up_to_date";
					result.regularApps[scope] = app;
				}
			} else {
				app.suite_version = null;
				result.regularApps[scope] = app;
			}
		}
		result.suiteVersions = suiteVersions;
		result.selectedSuite = {
			version: selectedSuiteVersion,
			sys_id: selectedSuiteSysId,
			isLatest: selectedSuiteVersion === latestSuite.version
		};
		result.latestSuite = {
			version: latestSuite.version,
			sys_id: latestSuite.sys_id
		};
		result.installedSuite = {
			version: installedSuiteVersion,
			sys_id: installedSuiteSysId
		};
		return result;
	},

	/**
	 * Returns the set of scopes for store apps with available updates.
	 * Used to filter the preview list to show only store apps (matching overview page counts).
	 * @returns {Object} Map of scope -> true
	 */
	getStoreAppScopesWithUpdates: function() {
		var scopes = {};
		// Matches App Manager query: only apps installed from store, out_of_band, or offline
		var grStoreApp = new GlideRecord("sys_store_app");
		grStoreApp.addQuery("update_available", true);
		grStoreApp.addQuery("active", true);
		grStoreApp.addQuery("last_installed_from", "IN", "store,out_of_band,offline");
		grStoreApp.query();
		while (grStoreApp.next()) {
			var appScope = grStoreApp.getValue("scope");
			if (appScope) {
				scopes[appScope] = true;
			}
		}
		gs.info("StoreAppsFlowUtils.getStoreAppScopesWithUpdates: found " + Object.keys(scopes).length + " scopes with available updates");
		return scopes;
	},

	/**
	 * For bulk app update sessions, filters regularApps to only include store apps
	 * with available updates (matching overview page counts).
	 * @param {Object} splitResult - Object with regularApps, goldenConfigApps, etc.
	 * @param {string} upgradeSessionId - Upgrade session sys_id
	 * @returns {Object} splitResult with regularApps filtered (mutated in place)
	 */
	filterRegularAppsForBulkUpdate: function(splitResult, upgradeSessionId) {
		if (!upgradeSessionId) return splitResult;
		var grSession = new GlideRecord("sn_um_upgrade_sessions");
		if (grSession.get(upgradeSessionId) && grSession.getValue("session_type") === "bulk_app_update") {
			var storeAppScopes = this.getStoreAppScopesWithUpdates();
			var filteredRegularApps = {};
			for (var scope in splitResult.regularApps) {
				if (storeAppScopes[scope]) {
					filteredRegularApps[scope] = splitResult.regularApps[scope];
				}
			}
			gs.info("StoreAppsFlowUtils: bulk_app_update filter retained " + Object.keys(filteredRegularApps).length + " of " + Object.keys(splitResult.regularApps).length + " regular apps");
			splitResult.regularApps = filteredRegularApps;
		}
		return splitResult;
	},

	getPreviewAppList: function(targetPatchId, upgradePlanSysId, upgradePreviewSysId) {
        /*
        sn_um_incoming_app - contains latest apps coming get_all_apps store API for target release
        sn_um_incoming_app_version - contains versions for all apps in sn_um_incoming_app
        sys_store_app - contains currently installed apps on the instance
        */
		var grCheckIncoming = new GlideRecord("sn_um_incoming_app");
		grCheckIncoming.addQuery("target_patch_id", targetPatchId);
		grCheckIncoming.query();
		var incomingCount = grCheckIncoming.getRowCount();
		if (incomingCount === 0) {
			gs.warn("No incoming apps found! The Store API may not have been called yet or returned no data.");
		}
		
        var grView = new GlideRecord("sn_upgrade_mgmt_um_preview_app_store_page");
        /* sn_upgrade_mgmt_um_preview_app_store_page = 
        sn_um_incoming_app(latest) JOIN sn_um_incoming_app_version(incoming) JOIN sys_store_app(currentstore)

        We use this view to fetch all the installed apps that have a version higher than the currently installed version
        */

        grView.addQuery("incoming_target_patch_id", targetPatchId);
        grView.addQuery("currentstore_active", true);	// Ignoring inactive sys_store_app records
		grView.query();
		
		var viewCount = grView.getRowCount();
		gs.info("View query returned " + viewCount + " records");

        var grPlanItem = new GlideRecord("sys_upgrade_plan_item"); // All the apps selected to update during upgrade are stored here. We use it to retreive the currently selected version for upgrade
        grPlanItem.addQuery("upgrade_plan", upgradePlanSysId); // Only fetching apps for current upgrade plan
		grPlanItem.query();

        var grPreviewApp = new GlideRecord("upgrade_preview_app"); // All the true ups and new OOB apps are stored here after upgrade preview generation
		grPreviewApp.addQuery("upgrade_preview", upgradePreviewSysId); // Only fetching true ups for the preview generated for the target version
		grPreviewApp.addNotNullQuery("oob_version");

		grPreviewApp.query();

		// Load all PreviewApp data by scope
		var previewAppMap = this._loadPreviewAppMap(grPreviewApp);

		// Load all PlanItem data by scope
		var planItemMap = this._loadPlanItemMap(grPlanItem);

        var upgradableApps = {}; //  {app_name , scope , installed_version , latest_available_version , upgradable_versions , selected}

		while (grView.next()) {
			this._addToUpgradableApps(grView, upgradableApps, previewAppMap, planItemMap);
		}

        // Handle "Installed" apps from upgrade_preview_app
        var grInstalledApp = new GlideRecord("sn_upgrade_mgmt_um_preview_store_apps_action_installed");
		/*
		sn_upgrade_mgmt_um_preview_store_apps_action_installed = 
		upgrade_preview_app(preview) LEFT JOIN sn_um_incoming_app(incomingparent) LEFT JOIN sn_um_incoming_app_version (incoming)

		We use this view to check if there is a new(not installed) OOB app available and if there are versions available higher than its true up version
		*/
        grInstalledApp.addQuery("preview_upgrade_preview", upgradePreviewSysId);
        grInstalledApp.addNotNullQuery("preview_oob_version");    // Filtering out store apps from preview
        grInstalledApp.addQuery("preview_action", "installed"); // Filtering out only new installs (OOB)
        grInstalledApp.query();

		this._handleInstalledApps(grInstalledApp, upgradableApps, planItemMap);
        

		this._handleMissingStoreApps(previewAppMap, planItemMap, upgradableApps);
		this._getAlreadyCheckedVersionInfo(upgradePlanSysId, upgradableApps);
		try {
			for(var scope in upgradableApps){
				var app = upgradableApps[scope];
				app.upgradable_versions.sort((currentVersion, targetVersion) => {
					if (!this.versionComparator.isUpgrade(currentVersion, targetVersion)) 
						return -1;
					if (this.versionComparator.isUpgrade(currentVersion, targetVersion)) 
						return 1;
					return 0;
				});
			}
		}catch(err){
			gs.error("Error in sorting preview apps version");
			gs.error(err);
		}
		var appCount = Object.keys(upgradableApps).length;
		if (appCount === 0) {
			gs.warn("No apps returned. Check if asyncFetchIncomingStoreApps() completed and targetPatchId is correct.");
		}
		
        return upgradableApps;
    },

	/**
	 * Gets preview app list split into golden config and regular apps.
	 * @param {string} targetPatchId - Target patch ID
	 * @param {string} upgradePlanSysId - Upgrade plan sys_id
	 * @param {string} upgradePreviewSysId - Upgrade preview sys_id
	 * @param {string} upgradeSessionId - Optional upgrade session ID
	 * @param {string} selectedSuiteVersion - Optional suite version from UI
	 * @returns {object} Object with goldenConfigApps, regularApps, and suite metadata
	 */
	getPreviewAppListWithSplit: function(targetPatchId, upgradePlanSysId, upgradePreviewSysId, upgradeSessionId, selectedSuiteVersion) {
		var upgradableApps = this.getPreviewAppList(targetPatchId, upgradePlanSysId, upgradePreviewSysId);

		var splitResult = this._splitAppsIntoGoldenAndRegular(upgradableApps, upgradeSessionId, selectedSuiteVersion);

		this.filterRegularAppsForBulkUpdate(splitResult, upgradeSessionId);

		return {
			goldenConfigApps: splitResult.goldenConfigApps,
			regularApps: splitResult.regularApps,
			allApps: upgradableApps,
			suiteVersions: splitResult.suiteVersions,
			selectedSuite: splitResult.selectedSuite,
			latestSuite: splitResult.latestSuite
		};
	},

	/**
	 * Gets available suite versions, optionally filtered by platform version.
	 * @param {string} upgradeSessionId - Optional upgrade session ID
	 * @returns {Object} Object with suiteVersions array, installedVersion, and defaultVersion
	 */
	getAvailableSuiteVersions: function(upgradeSessionId) {
		var availableVersions = this._getAvailableSuiteVersions(upgradeSessionId);
		var installedVersion = this._getInstalledSuiteVersion();
		var result = {
			suiteVersions: [],
			installedVersion: installedVersion,
			defaultVersion: null
		};
		for (var i = 0; i < availableVersions.length; i++) {
			result.suiteVersions.push(availableVersions[i]);
		}
		if (!installedVersion) {
			result.suiteVersions.push({
				version: "None",
				sys_id: null,
				name: "None",
				platform: null,
				installed: false
			});
		}
		if (availableVersions.length > 0) {
			result.defaultVersion = availableVersions[0].version;
		} else if (installedVersion) {
			result.defaultVersion = installedVersion.version;
		} else {
			result.defaultVersion = "None";
		}
		return result;
	},

	/**
	 * Gets the installed suite version.
	 * @returns {Object|null} Suite version object or null
	 */
	getInstalledSuiteVersion: function() {
		return this._getInstalledSuiteVersion();
	},

	/**
	 * Gets the latest available suite version.
	 * @param {string} upgradeSessionId - Optional upgrade session ID
	 * @returns {Object} Object with version and sys_id
	 */
	getLatestSuiteVersion: function(upgradeSessionId) {
		return this._getLatestSuiteVersion(upgradeSessionId);
	},

	/**
	 * Gets apps and their versions for a specific suite version.
	 * Reads from sn_um_incoming_suite_config and sn_um_incoming_suite_config_app_version_m2m.
	 * @param {String} suiteVersion - Suite version
	 * @returns {Object} Object with suiteName, suiteVersion, and apps
	 */
	getSuiteConfigApps: function(suiteVersion) {
		if (!suiteVersion) {
			return {};
		}
		var grSuiteConfig = new GlideRecord("sn_um_incoming_suite_config");
		grSuiteConfig.addQuery("version", suiteVersion);
		grSuiteConfig.addQuery("compatible", false);
		grSuiteConfig.addQuery("installed", false);
		grSuiteConfig.query();
		if (!grSuiteConfig.next()) {
			return {};
		}
		var suiteConfigSysId = grSuiteConfig.getValue("sys_id");
		var suiteName = grSuiteConfig.getValue("name");
		var grM2M = new GlideRecord("sn_um_incoming_suite_config_app_version_m2m");
		grM2M.addQuery("suite_config", suiteConfigSysId);
		grM2M.query();
		var apps = {};
		while (grM2M.next()) {
			var appScope = grM2M.getValue("app_scope");
			var appVersion = grM2M.getValue("app_version");
			apps[appScope] = appVersion;
		}
		return {
			suiteName: suiteName,
			suiteVersion: suiteVersion,
			apps: apps
		};
	},

	asyncFetchIncomingStoreApps: function(targetPatchId, upgradeSessionId) {
        // Trigger the background worker
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName("Upgrade Management - Fetch and store incoming store apps");
        worker.setScriptIncludeName("sn_upgrade_mgmt.UCAsyncFunctions");
        worker.setScriptIncludeMethod("fetchIncomingStoreApps");
        worker.putMethodArg("targetPatchId", targetPatchId);
		worker.putMethodArg("upgradeSessionId", upgradeSessionId);
        worker.setBackground(true);
        worker.start();

        var progressId = worker.getProgressID();
        var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
        if (sessionGR.get(upgradeSessionId)) {
            sessionGR.store_incoming_apps_exec_tracker = progressId;
            sessionGR.update();
        } else {
            gs.error('Record not found for sys_id: ' + upgradeSessionId);
        }
        return progressId;
    },
	asyncPreservePreviewCurrentState: function(targetPatchId, upgradePlanSysId, upgradePreviewSysId) {
		// Trigger the background worker
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName("Upgrade Management - Preserve Preview table state");
        worker.setScriptIncludeName("sn_upgrade_mgmt.UCAsyncFunctions");
        worker.setScriptIncludeMethod("preserveData");
        worker.putMethodArg("targetPatchId", targetPatchId);
		worker.putMethodArg("upgradePlanSysId", upgradePlanSysId);
		worker.putMethodArg("upgradePreviewSysId", upgradePreviewSysId);
        worker.setBackground(true);
        worker.start();

        var progressId = worker.getProgressID();
        // var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
        // if (sessionGR.get(upgradeSessionId)) {
        //     sessionGR.store_incoming_apps_exec_tracker = progressId;
        //     sessionGR.update();
        // } else {
        //     gs.error('Record not found for sys_id: ' + sysId);
        // }
        return progressId;
	},
	getPreservedAppList: function() {
		// This function retrieves the preserved app data from sn_um_app_state_preview_list table
		// and formats it in the same structure as returned by getPreviewAppList function
		try {
			var upgradableApps = {};
			var gr = new GlideRecord('sn_um_app_state_preview');
			gr.query();
			
			while(gr.next()) {
				var scope = gr.getValue('scope');
				var upgradableVersionsString = gr.getValue('upgradable_versions');
				var upgradableVersions = [];
				
				// Parse upgradable_versions JSON if it exists
				if (upgradableVersionsString) {
					try {
						upgradableVersions = JSON.parse(upgradableVersionsString);
					} catch (e) {
						gs.error('Error parsing upgradable_versions JSON for scope ' + scope + ': ' + e);
					}
				}
				
				// Create app object in the same format as returned by getPreviewAppList
				upgradableApps[scope] = {
					app_name: gr.getValue('app_name'),
					scope: scope,
					installed_version: gr.getValue('installed_version'),
					latest_available_version: gr.getValue('latest_available_version'),
					upgradable_versions: upgradableVersions,
					selected: gr.getValue('selected'),
					true_up_version: gr.getValue('true_up_version'),
					sys_code: gr.getValue('app_sys_id'), // app_sys_id maps to sys_code in getPreviewAppList
					state: gr.getValue('state'),
					status_message: gr.getValue('status_message')
				};
			}
			
			return upgradableApps;
		} catch (e) {
			gs.error('Error retrieving preserved app list: ' + e);
			return {};
		}
	},
	getPreservedAppListWithSplit: function(upgradeSessionId, selectedSuiteVersion) {
		var upgradableApps = this.getPreservedAppList();

		var splitResult = this._splitAppsIntoGoldenAndRegular(upgradableApps, upgradeSessionId, selectedSuiteVersion);

		this.filterRegularAppsForBulkUpdate(splitResult, upgradeSessionId);

		return {
			goldenConfigApps: splitResult.goldenConfigApps,
			regularApps: splitResult.regularApps,
			allApps: upgradableApps,
			suiteVersions: splitResult.suiteVersions,
			selectedSuite: splitResult.selectedSuite,
			latestSuite: splitResult.latestSuite,
			installedSuite: splitResult.installedSuite
		};
	},
	deleteUpgradePlanItems: function(upgradePlanSysId) {
        var gr = new GlideRecord('sys_upgrade_plan_item');
        gr.addQuery('upgrade_plan', upgradePlanSysId);
        gr.query();

        var itemsToDelete = [];

        while (gr.next()) {
            itemsToDelete.push({ sys_id: gr.getValue('sys_id') });
        }

        if (itemsToDelete.length > 0) {
            this.globalUmUtil.deleteRecords("sys_upgrade_plan_item", itemsToDelete);
        }
    },
	setAllStoreAppstoLatestInUpgradePlan: function(targetPatchId, upgradePlanSysId, upgradePreviewSysId) {
        // gs.info("here latest store " + targetPatchId + " - " +  upgradePlanSysId + " - " +  upgradePreviewSysId);
        // update set started
        var umUpdateSetSysID = this.globalUmUtil.getSessionUpdateSet();
        var previousUpdateSet = this.globalUmUtil.getActiveUpdateSet();
        this.globalUmUtil.updateActiveUpdateSet(umUpdateSetSysID);

        try {
            this.deleteUpgradePlanItems(upgradePlanSysId);


            var upgradableApps = this.getPreviewAppList(targetPatchId, upgradePlanSysId, upgradePreviewSysId);
			var itemsToInsert = [];

            Object.keys(upgradableApps).forEach(function(key) {
                var app = upgradableApps[key];
    
                var item = {
                    auto_generated: true,
                    id: app.sys_code,
                    last_refreshed: new GlideDateTime().getValue(),
                    name: app.app_name,
                    scope: app.scope,
                    source: (app.true_up_version && app.true_up_version === app.latest_available_version)
                            ? "upgrade_distribution"
                            : "store",
                    sys_name: app.app_name,
                    type: "application",
                    upgrade_plan: upgradePlanSysId,
                    version: app.latest_available_version
                };
				gs.info("items to insert are ", itemsToInsert.length);
    
                itemsToInsert.push(item);
            });
    
            if (itemsToInsert.length > 0) {
                this.globalUmUtil.insertRecords("sys_upgrade_plan_item", itemsToInsert);
            }
        } catch (e) {
            gs.error("Upgrade plan Item creation error- " + e);
        }
        // stop update set
        this.globalUmUtil.updateActiveUpdateSet(previousUpdateSet);
    },
    setTrueUpInUpgradePlan: function(upgradePlanSysId, upgradePreviewSysId) {
        var umUpdateSetSysID = this.globalUmUtil.getSessionUpdateSet();
        var previousUpdateSet = this.globalUmUtil.getActiveUpdateSet();
        this.globalUmUtil.updateActiveUpdateSet(umUpdateSetSysID);

        try {
            var grUpgradePlanItem = new GlideRecord("sys_upgrade_plan_item");
            grUpgradePlanItem.addQuery("upgrade_plan", upgradePlanSysId);
            grUpgradePlanItem.query();

            // Load all PreviewApp data by scope
            var upgradePlanItemMap = this._loadPlanItemMap(grUpgradePlanItem);

            var grPreviewApp = new GlideRecord("sn_upgrade_mgmt_upgrade_preview_app_sys_store_app_sn_um_incoming_app");
            grPreviewApp.addQuery("upa_upgrade_preview", upgradePreviewSysId);
            grPreviewApp.addNotNullQuery("upa_oob_version");
            grPreviewApp.query();

            var itemsToInsert = [];
            var itemsToUpdate = [];
            
            while (grPreviewApp.next()) {
                const scope = grPreviewApp.getValue("upa_scope");
                const oobVersion = grPreviewApp.getValue("upa_oob_version");
                const exsitingUpgradePlanItem = upgradePlanItemMap[scope];
                
                if (exsitingUpgradePlanItem === undefined) {
                    itemsToInsert.push({
                        auto_generated: true,
                        id: grPreviewApp.getValue("upa_app_sys_id") || grPreviewApp.getValue("currentstore_sys_id") || grPreviewApp.getValue("incoming_source_app_id"), // todo: this logic can be simplified as id is coming from upgrade_preview_app directly
                        last_refreshed: new GlideDateTime().getValue(),
                        name: grPreviewApp.getValue("upa_name"),
                        scope: grPreviewApp.getValue("upa_scope"),
                        source: "upgrade_distribution",
                        sys_name: grPreviewApp.getValue("upa_name"),
                        type: "application",
                        upgrade_plan: upgradePlanSysId,
                        version: grPreviewApp.getValue("upa_oob_version")
                    });
                } else if (!this.versionComparator.isDowngrade(exsitingUpgradePlanItem.selected_version, oobVersion)) {
                    itemsToUpdate.push({
                        sys_id: exsitingUpgradePlanItem.sys_id,
                        version: oobVersion,
                        source: "upgrade_distribution",
						state: '',
						status_message: '',
                        active: true,
                    });
                }
            }

            // gs.info(`Items to Insert ${itemsToInsert.map(item => `${item.name}: ${item.version}: ${item.source}`).join(', ')}`);

            // gs.info(`Items to Updates ${itemsToUpdate.map(item => `${item.sys_id}: ${item.version}: ${item.source}`).join(', ')}`);

            if (itemsToInsert.length > 0) {
                this.globalUmUtil.insertRecords("sys_upgrade_plan_item", itemsToInsert);
            }

            if (itemsToUpdate.length > 0) {
                this.globalUmUtil.updateRecords("sys_upgrade_plan_item", itemsToUpdate);
            }

        } catch (e) {
            gs.error("setTrueUpInUpgradePlan error- " + e);
        }

        this.globalUmUtil.updateActiveUpdateSet(previousUpdateSet); 
    },
	populateUpgradePlanTables: function(upgradeSessionId) {
        var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
        var upgradePlan = "";
        var upgradePreview = "";
        var targetPatchId = "";

        if (sessionGR.get(upgradeSessionId)) {
            upgradePlan = sessionGR.getValue('upgrade_plan');
            upgradePreview = sessionGR.getValue('upgrade_preview_store');
            targetPatchId = sessionGR.getValue('target_patch_id');


            gs.info('Upgrade Plan: ' + upgradePlan);
            gs.info('Upgrade Preview: ' + upgradePreview);
        }

        var configGR = new GlideRecord('sn_um_upgrade_session_config');
        configGR.addQuery('upgrade_session_id', upgradeSessionId);
        configGR.addQuery('setting_key', 'upgrade_store_apps_to_latest');
        configGR.query();
        var toggle_value = false;

        if (configGR.next()) {
            gs.info('Setting Key: ' + configGR.getValue('setting_key'));
            gs.info('Setting Value: ' + configGR.getValue('setting_value'));
            toggle_value = configGR.getValue('setting_value');
        } else {
            gs.error('No config found for the given session and setting_key.');
        }

        if (toggle_value == true) {
			gs.info('true - ' + toggle_value);
            this.setAllStoreAppstoLatestInUpgradePlan(targetPatchId, upgradePlan, upgradePreview);
        } else {
            gs.info('false -  ' + toggle_value);
            this.setTrueUpInUpgradePlan(upgradePlan, upgradePreview);
        }
    },
	createNewUpgradePlan: function(targetPatchId, upgrade_session_sysid) {
        var currPlan = new GlideRecord("sys_upgrade_plan");
        currPlan.addQuery("active", true); // Fetch only active records
        currPlan.query();

        while (currPlan.next()) {
            currPlan.active = false; // Set active to false
            currPlan.update(); // Save the record
        }
        gs.info("Updated all active records in sys_upgrade_plan.");

        // create update set here
        var umUpdateSetSysID = this.globalUmUtil.createUpdateSet();
        var previousUpdateSet = this.globalUmUtil.getActiveUpdateSet();
        this.globalUmUtil.updateActiveUpdateSet(umUpdateSetSysID);

        try {
            var upgradePlanName = "Upgrade Plan - " + targetPatchId;

			var targetVersion = targetPatchId;
			var sessionTypeGR = new GlideRecord('sn_um_upgrade_sessions');
			if (sessionTypeGR.get(upgrade_session_sysid) && sessionTypeGR.getValue("session_type") === "bulk_app_update") {
				targetVersion = "bulk_update_" + targetPatchId;
			}

            var planRecord = {
                last_refreshed: new GlideDateTime().getValue(),
                name: upgradePlanName,
                origin_instance_id: gs.getProperty("instance_id"),
                origin_instance_name: gs.getProperty("instance_name"),
                sys_name: upgradePlanName,
                target_version: targetVersion
            };

            var inserted = this.globalUmUtil.insertRecords("sys_upgrade_plan", [planRecord]);

            var planId =  inserted[0];
        } catch (e) {
            gs.error("New Upgrade plan creation error- " + e);
        }

        this.globalUmUtil.updateActiveUpdateSet(previousUpdateSet);
        var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
        if (sessionGR.get(upgrade_session_sysid)) {
            sessionGR.upgrade_plan = planId;
            sessionGR.created_upgrade_plan = planId;
            sessionGR.update();
        } else {
            gs.error('Record not found for um session sys_id: ' + upgrade_session_sysid);
        }

        gs.info("returning new planID " + planId);
        return planId;
    },
    createUpgradePlanAndFetchIncomingStoreApps: function(targetPatchId, upgrade_session_sysid) {
		var gr = new GlideRecord('sn_um_upgrade_sessions');
		var upgradePlanId = null;
		if(gr.get(upgrade_session_sysid)){
			upgradePlanId = gr.getValue('upgrade_plan');
		}
        var upgrade_plan_sysid = (upgradePlanId != null) ? upgradePlanId : this.createNewUpgradePlan(targetPatchId, upgrade_session_sysid);
        var store_incoming_apps_exec_tracker = this.asyncFetchIncomingStoreApps(targetPatchId, upgrade_session_sysid);
        return {
            "store_incoming_apps_exec_tracker": store_incoming_apps_exec_tracker,
            "upgrade_plan_sysid": upgrade_plan_sysid
        };
    },
	/**
	 * Adds or updates a single app in the upgrade plan.
	 * If selected version equals current version, the app is removed from the plan.
	 * Otherwise, it is added or updated with appropriate source.
	 */
    setAppInUpgradePlan: function(scope, sys_code, name, upgrade_plan_sysid, to_version, current_version, true_up_version) {
        var umUpdateSetSysID = this.globalUmUtil.getSessionUpdateSet();
        var previousUpdateSet = this.globalUmUtil.getActiveUpdateSet();
        this.globalUmUtil.updateActiveUpdateSet(umUpdateSetSysID);
    
        try {
            const gr = new GlideRecord("sys_upgrade_plan_item");
            gr.addQuery("upgrade_plan", upgrade_plan_sysid);
            gr.addQuery("scope", scope);
            gr.query();

            const planScourceGR = new GlideRecord("sys_upgrade_plan_source");
            planScourceGR.addQuery("upgrade_plan", upgrade_plan_sysid);
            planScourceGR.addQuery("scope", scope);
            planScourceGR.addQuery("version", to_version);
            planScourceGR.query();

            let planSourceFound = false;
            if(planScourceGR.next()) {
                planSourceFound = true;
            }
    
            if (gr.next()) {
                if (to_version === current_version) {
					// Making the record inactive
					this.globalUmUtil.updateRecords("sys_upgrade_plan_item", [
                        {
                            sys_id: gr.getUniqueValue(),
                            version: to_version,
							active: false,
							state: '',
							status_message: '',
							source: ''
                        }
                    ]);
                } else {
					// Update existing plan item with new version
                   this.globalUmUtil.updateRecords("sys_upgrade_plan_item", [
                        {
                            sys_id: gr.getUniqueValue(),
                            version: to_version,
							active: true,
                            state: planSourceFound ? 'ready': '',
							status_message: '',
							source: (true_up_version && true_up_version === to_version) ? "upgrade_distribution" : "store"
                        }
                    ]);
                }
            } else if (to_version !== current_version) {
				// Insert new plan item
                const item = {
                    auto_generated: true,
                    last_refreshed: new GlideDateTime().getValue(),
                    id: sys_code,
                    name: name,
                    scope: scope,
                    sys_name: name,
                    type: "application",
                    upgrade_plan: upgrade_plan_sysid,
                    version: to_version,
                    state: planSourceFound ? 'ready': '',
                    source: (true_up_version && true_up_version === to_version) ? "upgrade_distribution" : "store"
                };
    
               this.globalUmUtil.insertRecords("sys_upgrade_plan_item", [item]);
            }
    
        } catch (e) {
            gs.error("Upgrade plan item creation error - " + e);
        } finally {
            this.globalUmUtil.updateActiveUpdateSet(previousUpdateSet);
        }
    },
	processUpgradePlan: function(upgradePlanSysId) {
        gs.info("Starting upgrade plan process for " + upgradePlanSysId);
        return new sn_utc.UpgradePlanAPI().reprocessUpgradePlanSkipPreview(upgradePlanSysId);
    },
	prodFindCreateProcessActionScript: function(upgrade_session_sysid) {
        try {
            gs.info("Starting UM Find/Create & Start Processing prod upgrade plan");
            var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
            sessionGR.get(upgrade_session_sysid);

            var sysID = sessionGR.getValue('upgrade_plan');
            var targetPatchID = sessionGR.getValue("target_patch_id");
            var flag = false;
			var plansToUpdate = [];

			if(sysID){
				// Case 1 : Already has upgrade plan, just reuse it.
				gs.info("Session already has upgrade plan sys_id: " + sysID);
				flag = true;
			} else {
				// Case 2 : No plan in session, fallback to search/create
				var upgradePlanGR = new GlideRecord("sys_upgrade_plan");
				var upgradePlan = "Upgrade Plan - " + targetPatchID;
				// upgradePlanGR.addQuery("active", true);
				upgradePlanGR.orderByDesc('sys_updated_on');
				upgradePlanGR.query();
				while (upgradePlanGR.next()) {
					if (!flag && upgradePlanGR.getValue("name") === upgradePlan) {
						gs.info("found an imported upgrade plan")
						flag = true;
						sysID = upgradePlanGR.getValue("sys_id");
						plansToUpdate.push({
							sys_id: upgradePlanGR.getValue("sys_id"),
							active: true
						});
					} else {
						// mark all other active plans as inactive
						plansToUpdate.push({
							sys_id: upgradePlanGR.getValue("sys_id"),
							active: false
						});
					}
				}
			}

            // Bulk update inactive plans
            if (plansToUpdate.length > 0) {
                this.globalUmUtil.updateRecords("sys_upgrade_plan", plansToUpdate);
            }


            if (flag === false) {
                flag = true;
                // create new upgrade plan
                gs.info("creating new upgrade plan " + targetPatchID);

                sysID = this.createNewUpgradePlan(targetPatchID, upgrade_session_sysid);
            }
            // Start fetch store apps
            var store_incoming_apps_exec_tracker = this.asyncFetchIncomingStoreApps(targetPatchID, upgrade_session_sysid);


            // var process_upgrade_plan_execution_tracker = this.processUpgradePlan(sysID);

            if (sessionGR) {
                // sessionGR.process_upgrade_plan_execution_tracker = process_upgrade_plan_execution_tracker;
                sessionGR.store_incoming_apps_exec_tracker = store_incoming_apps_exec_tracker;
				sessionGR.setValue("upgrade_plan", sysID);
				gs.info("upgrade plan sysID ==== " + sysID);
            } else {
                gs.error('Record not found for um session sys_id: ' + upgrade_session_sysid);
            }
            sessionGR.update();

            return {
                flag: flag,
                // process_upgrade_plan_execution_tracker: process_upgrade_plan_execution_tracker,
                store_incoming_apps_exec_tracker: store_incoming_apps_exec_tracker
            };

        } catch (e) {
            gs.info("Error in executing upgrade plan" + e);
        }
    },

/**
 * Persists golden config apps from UI row data format to sys_upgrade_plan_item.
 * This method extracts app data from the UI row format and calls the main persistence method.
 * When suite version is "None" and rows are empty, fetches GC apps from upgrade plan.
 * 
 * @param {Object} gcRowData - Object containing golden config app rows from UI
 *                             Format: { rows: [{ cells: { scope, selected_suite, ... } }] }
 * @param {String} upgradePlanSysId - The sys_id of the upgrade plan
 * @param {String} selectedSuiteVersion - The selected suite version (can be "None")
 * @returns {Object} Result object with counts of inserted and updated records
 */
persistGoldenConfigAppsFromRowData: function(gcRowData, upgradePlanSysId, selectedSuiteVersion) {  
    if (!gcRowData) {
        gs.error("persistGoldenConfigAppsFromRowData: gcRowData is null or undefined");
        return { inserted: 0, updated: 0, error: "gcRowData is missing", success: false };
    }
    
    if (!upgradePlanSysId) {
        gs.error("persistGoldenConfigAppsFromRowData: upgradePlanSysId is missing");
        return { inserted: 0, updated: 0, error: "upgradePlanSysId is missing", success: false };
    }

    var goldenConfigApps = {};
    
    if (selectedSuiteVersion === "None" && (!gcRowData.rows || gcRowData.rows.length === 0)) {
        return this.updateGoldenConfigAppVersionsInUpgradePlan(goldenConfigApps, upgradePlanSysId, selectedSuiteVersion);
    }
    
    // Normal case: process rows from UI
    if (!gcRowData.rows) {
        gs.error("persistGoldenConfigAppsFromRowData: gcRowData.rows is null or undefined");
        return { inserted: 0, updated: 0, error: "gcRowData.rows is missing", success: false };
    }

    // Convert row data format to app object format
    for (var i = 0; i < gcRowData.rows.length; i++) {
        var row = gcRowData.rows[i];
        if (!row.cells) {
            continue;
        }

        var scope = row.cells.scope ? row.cells.scope.value : null;
        var selectedVersion = row.cells.selected_suite && row.cells.selected_suite.componentProps 
            ? row.cells.selected_suite.componentProps.selectedItems[0] 
            : null;
        var appName = row.cells.app_name ? row.cells.app_name.label : null;
        var sysCode = row.cells.sys_code ? row.cells.sys_code.value : null;
        var trueUpVersion = row.cells.suite_version ? row.cells.suite_version.value : null;
        if (scope) {
            goldenConfigApps[scope] = {
                app_name: appName,
                scope: scope,
                selected: selectedVersion,
                selected_suite: selectedVersion,
                sys_code: sysCode,
                true_up_version: trueUpVersion
            };
        }
    }
    return this.updateGoldenConfigAppVersionsInUpgradePlan(goldenConfigApps, upgradePlanSysId, selectedSuiteVersion);
},

/**
 * Updates sys_upgrade_plan_item records for golden config apps with their selected suite versions.
 * This method is called when the suite version dropdown changes to persist the selected versions.
 * When "None" is selected, only golden config apps are deactivated (not regular apps).
 * 
 * @param {Object} goldenConfigApps - Object containing golden config apps with their selected versions
 *                                     Format: { scope: { app_name, scope, selected, sys_code, ... } }
 * @param {String} upgradePlanSysId - The sys_id of the upgrade plan
 * @param {String} selectedSuiteVersion - The selected suite version (can be "None")
 * @returns {Object} Result object with counts of inserted and updated records
 */
updateGoldenConfigAppVersionsInUpgradePlan: function(goldenConfigApps, upgradePlanSysId, selectedSuiteVersion) {
    if (!goldenConfigApps || !upgradePlanSysId) {
        gs.error("updateGoldenConfigAppVersionsInUpgradePlan: Missing required parameters");
        return { inserted: 0, updated: 0, error: "Missing required parameters" };
    }

    var umUpdateSetSysID = this.globalUmUtil.getSessionUpdateSet();
    var previousUpdateSet = this.globalUmUtil.getActiveUpdateSet();
    this.globalUmUtil.updateActiveUpdateSet(umUpdateSetSysID);

    try {
        var grPlanItem = new GlideRecord("sys_upgrade_plan_item");
        grPlanItem.addQuery("upgrade_plan", upgradePlanSysId);
        grPlanItem.query();

        var planItemMap = this._loadPlanItemMap(grPlanItem);

        var itemsToInsert = [];
        var itemsToUpdate = [];
        var isNoneSuite = (selectedSuiteVersion === "None");
        if (isNoneSuite) {
            var suiteAppsMap = this._loadSuiteConfigApps(null, null); // Get all suite apps
            var goldenConfigScopes = {};
            
            // Build a set of all scopes that are in any suite version
            for (var suiteName in suiteAppsMap) {
                for (var version in suiteAppsMap[suiteName]) {
                    for (var appScope in suiteAppsMap[suiteName][version]) {
                        goldenConfigScopes[appScope] = true;
                    }
                }
            }            
            // Only deactivate apps whose scopes are in the suite configs (golden config apps)
            for (var scope in planItemMap) {
                if (goldenConfigScopes[scope]) {
                    itemsToUpdate.push({
                        sys_id: planItemMap[scope].sys_id,
                        active: false,
                        version: "",
                        source: "",
                        state: "",
                        status_message: ""
                    });
                } else {
                    gs.info("GC Update: Skipping non-golden-config app with scope = " + scope);
                }
            }

            // Execute the updates and return early
            if (itemsToUpdate.length > 0) {
                this.globalUmUtil.updateRecords("sys_upgrade_plan_item", itemsToUpdate);
            }
            return {
                inserted: 0,
                updated: itemsToUpdate.length,
                success: true
            };
        }

        // Normal processing when suite version is selected
        for (var scope in goldenConfigApps) {
            var app = goldenConfigApps[scope];
            var existingPlanItem = planItemMap[scope];
            var selectedVersion = app.selected || app.selected_suite;
            
            if (!selectedVersion) {
                continue;
            }

            if (!existingPlanItem) {
                itemsToInsert.push({
                    auto_generated: true,
                    id: app.sys_code,
                    last_refreshed: new GlideDateTime().getValue(),
                    name: app.app_name,
                    scope: scope,
                    source: (app.true_up_version && app.true_up_version === selectedVersion)
                            ? "upgrade_distribution"
                            : "store",
                    sys_name: app.app_name,
                    type: "application",
                    upgrade_plan: upgradePlanSysId,
                    version: selectedVersion
                });
            } else if (existingPlanItem.selected_version !== selectedVersion) {
                itemsToUpdate.push({
                    sys_id: existingPlanItem.sys_id,
                    version: selectedVersion,
                    source: (app.true_up_version && app.true_up_version === selectedVersion)
                            ? "upgrade_distribution"
                            : "store",
                    last_refreshed: new GlideDateTime().getValue(),
                    state: '',
                    status_message: '',
                    active: true
                });
            }
        }
        if (itemsToInsert.length > 0) {
            this.globalUmUtil.insertRecords("sys_upgrade_plan_item", itemsToInsert);
        }

        if (itemsToUpdate.length > 0) {
            this.globalUmUtil.updateRecords("sys_upgrade_plan_item", itemsToUpdate);
        }

        return {
            inserted: itemsToInsert.length,
            updated: itemsToUpdate.length,
            success: true
        };

    } catch (e) {
        gs.error("updateGoldenConfigAppVersionsInUpgradePlan error: " + e);
        return {
            inserted: 0,
            updated: 0,
            error: e.toString(),
            success: false
        };
    } finally {
        this.globalUmUtil.updateActiveUpdateSet(previousUpdateSet);
    }
},
	/**
	 * Gets the selected suite version from the upgrade session.
	 * 
	 * @param {String} upgradeSessionId - The upgrade session sys_id
	 * @returns {String|null} The selected suite version or null if not found
	 */
	getSelectedSuiteVersionFromConfig: function(upgradeSessionId) {
		if (!upgradeSessionId) {
			return null;
		}
		
		var gr = new GlideRecord('sn_um_upgrade_sessions');
		if (gr.get(upgradeSessionId)) {
			return gr.getValue('selected_suite_version');
		}
		
		return null;
	},
	/**
	 * Saves the selected suite version to the upgrade session.
	 * 
	 * @param {String} upgradeSessionId - The upgrade session sys_id
	 * @param {String} suiteVersion - The suite version to save
	 * @returns {Boolean} True if successful, false otherwise
	 */
	setSelectedSuiteVersionInConfig: function(upgradeSessionId, suiteVersion) {
		if (!upgradeSessionId || !suiteVersion) {
			gs.error("setSelectedSuiteVersionInConfig: Missing required parameters");
			return false;
		}
		
		var gr = new GlideRecord('sn_um_upgrade_sessions');
		if (gr.get(upgradeSessionId)) {
			gr.setValue('selected_suite_version', suiteVersion);
			gr.update();
			gs.info("Updated selected_suite_version to " + suiteVersion + " for session " + upgradeSessionId);
			return true;
		}
		
		gs.error("setSelectedSuiteVersionInConfig: Session not found: " + upgradeSessionId);
		return false;
	},

    type: 'StoreAppsFlowUtils'
};
