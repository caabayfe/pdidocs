var PostStoreAppsFlowUtil = Class.create();
PostStoreAppsFlowUtil.prototype = {
    initialize: function() {
        this.versionComparator = new sn_appclient.VersionComparator(); 
    },
    _loadPreviewAppMap: function(grPreviewApp) {
        const map = {};

        while (grPreviewApp.next()) {
            const scope = grPreviewApp.getValue("scope");
            map[scope] = {
                true_up_version: grPreviewApp.getValue("oob_version"),
                scope: scope,
                current_version: grPreviewApp.getValue("from_version"),
                name: grPreviewApp.getValue("name"),
                action: grPreviewApp.getValue("action")
            };
        }

        return map;
    },
    fetchAllAvailableVersions: function() {
		var indicatorsObj = {};
        var versions = {};
        var versionGR = new GlideRecord('sys_app_version');
        versionGR.query();
        while (versionGR.next()) {
            var scope = versionGR.getValue('scope');
            var version = versionGR.getValue('version');
			var indicator = versionGR.getValue('indicators');
            if (!versions[scope]) {
                versions[scope] = [];
            }

			if (!indicatorsObj[scope]) {
                indicatorsObj[scope] = {};
            }
            if (versions[scope].indexOf(version) === -1) {
                versions[scope].push(version);
            }

			var versionIndicators = JSON.parse(indicator);
			if(Array.isArray(versionIndicators)){
				indicatorsObj[scope][version] = versionIndicators.some(indicator => indicator.type === "error");
			}
        }
        return { allAvailableVersions: versions,  indicators: indicatorsObj };
    },
    getUpgradableVersions: function(appScope, currentVersion, allAvailableVersions) {
        var upgradableVersions = [];

        var availableVersions = allAvailableVersions[appScope] || [];

        if (!availableVersions || availableVersions.length === 0)
            return [];

        if (!currentVersion || currentVersion == '')
            return availableVersions;

        for (var i = 0; i < availableVersions.length; i++) {
            var availableVersion = availableVersions[i];
            if (this.versionComparator.isUpgrade(currentVersion, availableVersion)) {
                upgradableVersions.push(availableVersion);
            }
        }

        if (upgradableVersions.length === 0) {
            return [];
        }

        try {
            upgradableVersions.sort((currentVersion, targetVersion) => {
                if (!this.versionComparator.isUpgrade(currentVersion, targetVersion))
                    return -1;
                if (this.versionComparator.isUpgrade(currentVersion, targetVersion))
                    return 1;
                return 0;
            });
        } catch (err) {
            gs.error(JSON.stringify({
                error: err,
                message: "Error in sorting upgradableVersions in Post store page upgrade console"
            }));
        }


        return upgradableVersions;

    },
   getUpgradeAppList: function(upgradePlanSysId, upgradePreviewSysId, sessionType, upgradeSessionId) {
    var scheduledApps = {};
    var _processedApps = {};
    var upgradePreviewStartDate = new GlideDateTime();
    upgradePreviewStartDate.addDaysUTC(-30);

    var upgradePreviewRecord = new GlideRecord("upgrade_preview");
    if (upgradePreviewRecord.get(upgradePreviewSysId)) {
        upgradePreviewStartDate = upgradePreviewRecord.getValue("preview_started");
    }

    // Resolve current BU session's start time so we can scope the schedule-item
    // query to items created during this session's lifetime. This handles BOTH
    // scheduling code paths in the BU flow:
    //   1) Update Applications page → BulkUpdateAppUtils.scheduleBatchInstallFromUpgradePlan
    //      (one parent schedule, N items) — sets session.batch_app_install_schedule
    //   2) Review Update Results page → "Handle Batch Schedule Selected Apps"
    //      client script → REST /api/sn_appclient/v1/appmanager/schedule?action=create_schedule
    //      (N parent schedules, 1 item each) — does NOT set session.batch_app_install_schedule
    // A simple time-floor filter covers both because every item created during
    // this session has sys_created_on >= session.sys_created_on, regardless of
    // which parent schedule it belongs to. Items from previously cancelled
    // sessions were created earlier and are filtered out cleanly.
    var currentSessionStart = null;
    if (sessionType === 'bulk_app_update' && upgradeSessionId) {
        var sessionGRForSchedule = new GlideRecord("sn_um_upgrade_sessions");
        if (sessionGRForSchedule.get(upgradeSessionId)) {
            currentSessionStart = sessionGRForSchedule.getValue("sys_created_on");
        }
    }

    var scheduleItemGr = new GlideRecord("sys_installation_schedule_item");
    scheduleItemGr.addQuery("state", "ready");
    scheduleItemGr.orderByDesc("created");

    if (currentSessionStart) {
        // BU flow: scope to items created within this session's lifetime.
        scheduleItemGr.addQuery("sys_created_on", ">=", currentSessionStart);
    } else if (upgradePreviewStartDate) {
        // Upgrade (non-BU) flow: preserve existing preview-start-date behavior.
        scheduleItemGr.addQuery("sys_created_on", ">=", upgradePreviewStartDate);
    }

    scheduleItemGr.query();


    while (scheduleItemGr.next()) {
        var _appId = scheduleItemGr.getValue("source_app_id");
        if (!_processedApps[_appId]) {
            scheduledApps[_appId] = {
                start_time: scheduleItemGr.getValue("start_time"),
                schedule_id: scheduleItemGr.getValue("schedule"),
                version: scheduleItemGr.getValue("version"),
            }; 
            _processedApps[_appId] = true; 
        }
    }

    var trackersOfRunningApps = {};
    var progressTrackerStatus = {};

    // Same time-floor parity for the progress-tracker query: BU flow uses
    // session.sys_created_on so tracker rows from cancelled prior sessions
    // don't bleed into the in-progress display. Non-BU flow keeps the
    // existing upgrade_preview / 30-day fallback behavior.
    var appclientProgressTrackerGR = new GlideRecord('sn_appclient_progress_tracker');
    if (currentSessionStart) {
        appclientProgressTrackerGR.addQuery("sys_created_on", ">=", currentSessionStart);
    } else if (upgradePreviewStartDate) {
        appclientProgressTrackerGR.addQuery("sys_created_on", ">=", upgradePreviewStartDate);
    }

    appclientProgressTrackerGR.orderBy("sys_updated_on");

    appclientProgressTrackerGR.query();

    while (appclientProgressTrackerGR.next()) {

        var stateDisplayValue = "";
        var trackerId;
        var appSysIdFromTracker;

        const execTrackerType = appclientProgressTrackerGR.getValue("type");
        const execTrackerName = appclientProgressTrackerGR.getValue("name");
        const execTrackerState = appclientProgressTrackerGR.getValue('state');
        var trackerStartTime = appclientProgressTrackerGR.getValue("start_time");
        var productPayload = appclientProgressTrackerGR.getValue("payload");

        var installingVersion;
        var productPayloadObj = {};

        if (productPayload) {
            try {
                productPayloadObj = JSON.parse(productPayload);
            } catch (e) {
                gs.error("Invalid JSON in productPayload: " + e.message);
                productPayloadObj = {};
            }
            installingVersion = productPayloadObj.version;
        }

        if (execTrackerState != 2) {
            var sysExecutionTrackerGR = new GlideRecord("sys_execution_tracker");
            trackerId = appclientProgressTrackerGR.getValue('tracker_id');
            sysExecutionTrackerGR.get(trackerId);
            stateDisplayValue = sysExecutionTrackerGR.getDisplayValue("state");
        } else {
            stateDisplayValue = appclientProgressTrackerGR.getDisplayValue("state");
        }

        if (execTrackerType == 'product' && execTrackerName.startsWith("UpgradeManagementConsoleBatchUpdate")) {
            var packages = productPayloadObj?.packages;
            packages && packages.forEach(app => {
                if (execTrackerState != 2) {

                    var scheduleStartTime1 = scheduledApps[app.id] && scheduledApps[app.id].start_time;
                    if (!scheduleStartTime1 || trackerStartTime > scheduleStartTime1) {
                        trackersOfRunningApps[app.id] = {
                            trackerId: trackerId,
                            version: installingVersion || app.requested_version
                        };
                        progressTrackerStatus[app.id] = stateDisplayValue;
                    }
                }
            });
        } else {
            appSysIdFromTracker = appclientProgressTrackerGR.getValue("app_id");

            var scheduleStartTime2 = scheduledApps[appSysIdFromTracker] && scheduledApps[appSysIdFromTracker].start_time;
            if (!scheduleStartTime2 || trackerStartTime > scheduleStartTime2) {
                trackersOfRunningApps[appSysIdFromTracker] = {
                    trackerId: trackerId,
                    version: installingVersion
                };
                progressTrackerStatus[appSysIdFromTracker] = stateDisplayValue;
            }
        }

    }

    var apps = {};

    var grPreviewApp = new GlideRecord("upgrade_preview_app"); 
    grPreviewApp.addQuery("upgrade_preview", upgradePreviewSysId); 
    grPreviewApp.addNotNullQuery("oob_version");
    grPreviewApp.query();
    var previewAppMap = this._loadPreviewAppMap(grPreviewApp);
    var versionsAndIndicators = this.fetchAllAvailableVersions(); 
    var allAvailableVersions = versionsAndIndicators.allAvailableVersions;
    var indicatorsObj = versionsAndIndicators.indicators;
    
    var dependenciesMap = this._loadAllDependencies();
    const failedNewInstalls = this.getFailedAppsFromUpgradePreview(
        upgradePlanSysId, apps, trackersOfRunningApps, progressTrackerStatus, 
        allAvailableVersions, scheduledApps, indicatorsObj, dependenciesMap
    );
    
    const {successUpgrades, successNewInstalls} = this.getInstalledAppsFromUpgradePreview(
        upgradePlanSysId, apps, trackersOfRunningApps, progressTrackerStatus, 
        allAvailableVersions, previewAppMap, scheduledApps, indicatorsObj, dependenciesMap
    );
    
    this.getSysStoreApps(
        apps, trackersOfRunningApps, progressTrackerStatus,
        allAvailableVersions, scheduledApps, indicatorsObj, dependenciesMap, sessionType
    );

    var sortedApps = Object.values(apps).sort((a, b) => a.app_name.localeCompare(b.app_name));

    apps = sortedApps;
    return {
        apps,
        successUpgrades,
        successNewInstalls
    };

},
   getSysStoreApps: function(apps, trackersOfRunningApps, progressTrackerStatus,
    allAvailableVersions, scheduledApps, indicatorsObj, dependenciesMap, sessionType) {

    // Query stays exactly as original (active=true). Bulk App Update filter is
    // applied INSIDE the loop so in-flight apps (active tracker or schedule)
    // bypass the filter and the existing tracker-push preservation logic still runs.
    var gr = new GlideRecord('sys_store_app');
    gr.addQuery("active", true);
    gr.query();

    while (gr.next()) {
        var __appScope = gr.getValue('scope');
        if (apps.hasOwnProperty(__appScope))
            continue;

        var __currentVersion = gr.getValue('version');
        var __appName = gr.getValue('name');
        var __appSysId = gr.getValue('sys_id');
        var __isStoreApp = gr.getValue('is_store_app');
        var __statusMessage = "Not selected";

        var __dependencies = dependenciesMap[__appSysId] || gr.getValue('dependencies') || "";

        var __upgradableVersions = this.getUpgradableVersions(__appScope, __currentVersion, allAvailableVersions);
        var __hasTracker = !!trackersOfRunningApps[__appSysId];
        var __hasSchedule = !!(scheduledApps[__appSysId]);

        if (__hasTracker && __upgradableVersions.length === 0) {
            __upgradableVersions.push(__currentVersion);
        }

        // Bulk App Update flow only: for apps NOT already in any active flow context
        // (no preview row — already filtered above via apps.hasOwnProperty, no tracker,
        // no schedule), apply App Manager's "needs update" filter to exclude
        // dist/custom apps. In-flight apps (tracker/schedule) bypass this check so
        // existing keep-on-update behavior is preserved.
        // NOTE: gr.getValue('update_available') returns "1" / "0" for glide_boolean.
        if (sessionType === 'bulk_app_update' && !__hasTracker && !__hasSchedule) {
            var __updateAvailable = gr.getValue('update_available');
            var __lastInstalledFrom = gr.getValue('last_installed_from');
            var __isStoreSource = (__lastInstalledFrom === 'store' ||
                                   __lastInstalledFrom === 'out_of_band' ||
                                   __lastInstalledFrom === 'offline');
            if (__updateAvailable !== '1' || !__isStoreSource) {
                continue;
            }
        }

        if (__upgradableVersions.length > 0) {
            apps[__appScope] = {
                app_name: __appName,
                app_sys_id: __appSysId,
                is_store_app: __isStoreApp,
                scope: __appScope,
                installed_version: __currentVersion ? __currentVersion : 'Not installed',
                upgradable_versions: __upgradableVersions,
                status_message: __statusMessage,
                disposition: "",
                schedule: scheduledApps[__appSysId],
                state: progressTrackerStatus[__appSysId],
                tracker: trackersOfRunningApps[__appSysId],
                indicators: indicatorsObj[__appScope],
                dependencies: __dependencies 
            };
        }
    }
},

getInstalledAppsFromUpgradePreview: function(upgradePlanSysId, apps, trackersOfRunningApps, 
    progressTrackerStatus, allAvailableVersions, previewAppMap, scheduledApps, indicatorsObj, dependenciesMap) {
    
    var grView = new GlideRecord('sn_upgrade_mgmt_um_upgrade_app_store_page_view_installed');
    grView.addQuery("planitem_upgrade_plan", upgradePlanSysId);
    grView.addQuery("planitem_active", true);
    grView.orderBy("history_status_message");
    grView.query();
    var successNewInstalls = 0;
    var successUpgrades = 0;
    while (grView.next()) {
        var currentVersion = grView.getValue('currentstore_version');
        var appScope = grView.getValue('currentstore_scope');
        var appName = grView.getValue('currentstore_name');
        var appSysId = grView.getValue('currentstore_sys_id');
        var isStoreApp = grView.getValue('currentstore_is_store_app');
        var statusMessage = grView.getValue('history_status_message');
        var planItemVersion = grView.getValue('planitem_version');
        var disposition = grView.getValue('history_disposition');
        var dependencies = dependenciesMap[appSysId] || "";

        if (disposition && disposition.toLowerCase() === "failed" && currentVersion === planItemVersion) {
            statusMessage = "";
            disposition = "installed";
        }

        if (disposition && disposition.toLowerCase() !== "failed" && !apps.hasOwnProperty(appScope)) {
            if (previewAppMap[appScope] && previewAppMap[appScope].action.toLowerCase() === "installed") {
                successNewInstalls++;
            } else {
                successUpgrades++;
            }
        }
        
        var upgradableVersions = this.getUpgradableVersions(appScope, currentVersion, allAvailableVersions);

        if (upgradableVersions.length === 0) {
            upgradableVersions.push(currentVersion);
        }

        if (upgradableVersions.length > 0) {
            apps[appScope] = {
                app_name: appName,
                app_sys_id: appSysId,
                is_store_app: isStoreApp,
                scope: appScope,
                installed_version: currentVersion ? currentVersion : 'Not installed',
                upgradable_versions: upgradableVersions,
                status_message: statusMessage,
                disposition: disposition,
                schedule: scheduledApps[appSysId],
                plan_item_version: planItemVersion,
                state: progressTrackerStatus[appSysId],
                tracker: trackersOfRunningApps[appSysId],
                indicators: indicatorsObj[appScope] || {},
                dependencies: dependencies
            };
        }
    }

    return {
        successUpgrades,
        successNewInstalls
    };
},

  getFailedAppsFromUpgradePreview: function(upgradePlanSysId, apps, trackersOfRunningApps, 
    progressTrackerStatus, allAvailableVersions, scheduledApps, indicatorsObj, dependenciesMap) {
    
    var grFailedView = new GlideRecord('sn_upgrade_mgmt_um_upgrade_app_store_page_view_failed');
    grFailedView.addQuery("planitem_upgrade_plan", upgradePlanSysId);
    grFailedView.orderBy("history_status_message"); 
    grFailedView.query();
    var countNewInstallFailed = 0;
    while (grFailedView.next()) {
        countNewInstallFailed++;
        var _currentVersion = grFailedView.getValue('currentstore_version');
        var _appScope = grFailedView.getValue('currentstore_scope');
        var _appName = grFailedView.getValue('currentstore_name');
        var _appSysId = grFailedView.getValue('currentstore_sys_id');
        var _isStoreApp = grFailedView.getValue('currentstore_is_store_app');
        var _statusMessage = grFailedView.getValue('history_status_message');
        var _disposition = grFailedView.getValue('history_disposition');
        var _planItemVersion = grFailedView.getValue('planitem_version');
        var _dependencies = dependenciesMap[_appSysId] || "";

        var _upgradableVersions = this.getUpgradableVersions(_appScope, "0.0.0", allAvailableVersions); 
        if (trackersOfRunningApps[_appSysId] && _upgradableVersions.length === 0) {
            _upgradableVersions.push(_currentVersion);
        }

        if (_upgradableVersions.length > 0) {
            apps[_appScope] = {
                app_name: _appName,
                app_sys_id: _appSysId,
                is_store_app: _isStoreApp,
                scope: _appScope,
                installed_version: "Not installed",
                upgradable_versions: _upgradableVersions,
                status_message: _statusMessage,
                disposition: _disposition,
                plan_item_version: _planItemVersion,
                schedule: scheduledApps[_appSysId],
                state: progressTrackerStatus[_appSysId],
                tracker: trackersOfRunningApps[_appSysId],
                indicators: indicatorsObj[_appScope],
                dependencies: _dependencies
            };
        }
    }
    
    return countNewInstallFailed;
},
	/**
 * Pre-loads all app dependencies into a map keyed by app_sys_id
 * This is more efficient than querying sys_store_app for each app individually
 * @returns {Object} Map of app_sys_id -> dependencies string
 */
_loadAllDependencies: function() {
    var dependenciesMap = {};
    
    var gr = new GlideRecord('sys_store_app');
    gr.addQuery('active', true);
    gr.query();
    
    while (gr.next()) {
        var appSysId = gr.getValue('sys_id');
        var dependencies = gr.getValue('dependencies') || "";
        dependenciesMap[appSysId] = dependencies;
    }
    
    gs.info("PostStoreAppsFlowUtil: Loaded dependencies for " + Object.keys(dependenciesMap).length + " apps");
    return dependenciesMap;
},

	/**
	 * Gets all available suite versions from sys_suite_config table.
	 * Filters by platform version from the upgrade session.
	 * Returns array of suite versions sorted in descending order (newest first).
	 * @param {string} upgradeSessionId - Optional upgrade session ID to filter by platform version
	 * @returns {Array} Array of suite version objects with version, sys_id, name, platform, and installed flag
	 */
_getAvailableSuiteVersions: function(upgradeSessionId) {
        var targetPlatformVersion = null;
        
        if (upgradeSessionId) {
            var grSession = new GlideRecord("sn_um_upgrade_sessions");
            if (grSession.get(upgradeSessionId)) {
                targetPlatformVersion = grSession.getValue("target_platform_version");
                gs.info("Filtering suite versions by platform version: " + targetPlatformVersion);
            }
        }
        
        var grSuiteConfig = new GlideRecord("sys_suite_config");
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
	 * Gets the installed suite version from sys_suite_config table.
	 * Returns the suite version object if found, null otherwise.
	 * @returns {Object|null} Suite version object with version, sys_id, name, platform, and installed flag, or null
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
			gs.info("Found installed suite version: " + installedSuite.version);
			return installedSuite;
		}
		
		gs.info("No installed suite version found");
		return null;
	},

	/**
	 * Gets the latest (maximum) available suite version from sys_suite_config table.
	 * Optionally filters by platform version from the upgrade session.
	 * Returns the latest version using version comparison.
	 * @param {string} upgradeSessionId - Optional upgrade session ID to filter by platform version
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
	 * Loads all apps and their versions from a specific suite config.
	 * Returns a map of apps keyed by scope with their suite version.
	 * 
	 * @param {String} suiteConfigSysId - Sys ID of the suite config (optional, if not provided loads all)
	 * @param {String} suiteVersion - Suite version (optional)
	 * @returns {Object} - Map of suite name -> suite version -> apps
	 */
	_loadSuiteConfigApps: function(suiteConfigSysId, suiteVersion) {
		var suiteAppsMap = {};

		if (suiteConfigSysId && suiteVersion) {
			var grM2M = new GlideRecord("sys_suite_config_app_version_m2m");
			grM2M.addQuery("suite_config", suiteConfigSysId);
			grM2M.query();

			var grSuite = new GlideRecord("sys_suite_config");
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
			var grSuiteAll = new GlideRecord("sys_suite_config");
			grSuiteAll.addQuery("compatible", true);
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

				// Load apps for this suite version
				var grM2M = new GlideRecord("sys_suite_config_app_version_m2m");
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

_splitAppsIntoGoldenAndRegular: function(apps, upgradeSessionId, selectedSuiteVersionParam) {
    var result = {
        goldenConfigApps: {},
        regularApps: {}
    };

    var suiteVersions = this._getAvailableSuiteVersions(upgradeSessionId);
    
    if (suiteVersions.length === 0) {
        for (var scope in apps) {
            apps[scope].suite_version = null;
            result.regularApps[scope] = apps[scope];
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
        gs.info("Found installed suite version: " + installedSuiteVersion);
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
            gs.info("Using suite version from UI state: " + selectedSuiteVersion);
        } else {
            selectedSuiteVersion = latestSuite.version;
            selectedSuiteSysId = latestSuite.sys_id;
            gs.warn("UI state suite version not found, falling back to latest: " + selectedSuiteVersion);
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
                gs.info("Saved version not found in available versions, using latest: " + selectedSuiteVersion);
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
    
    gs.info("Loaded suite configs - Selected: " + selectedSuiteVersion + ", Latest: " + latestSuite.version);
    for (var scope in apps) {
        var app = apps[scope];
        
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

            var installedVersion = app.installed_version;

            if (installedVersion === selectedSuiteAppVersion) {
                app.state = "up_to_date";
                app.status_message = "Installed";  
                app.disposition = "installed";      
            } else if (installedVersion === "Not Installed" || installedVersion === "Not installed") {
                app.state = "will_be_installed";
                app.status_message = "Will be installed";  
                app.disposition = "";
            } else if (this.versionComparator.isUpgrade(installedVersion, selectedSuiteAppVersion)) {
                app.state = "will_be_updated";
                app.status_message = "Will be updated";  
                app.disposition = "";
            } else {
                app.state = "up_to_date";
                app.status_message = "Installed";  
                app.disposition = "installed";     
            }
            
            result.goldenConfigApps[scope] = app;
            
        } else {
            app.suite_version = null;
            result.regularApps[scope] = app;
        }
    }
    
    gs.info("Split result - Golden config apps: " + Object.keys(result.goldenConfigApps).length + 
            ", Regular apps: " + Object.keys(result.regularApps).length);

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
	 * Gets upgrade app list split into golden config apps and regular apps.
	 * Golden config apps are those that are part of the selected suite config and require an update.
	 * 
	 * @param {string} upgradePlanSysId - Upgrade plan sys_id
	 * @param {string} upgradePreviewSysId - Upgrade preview sys_id
	 * @param {string} upgradeSessionId - Optional upgrade session ID to determine suite version selection
	 * @param {string} selectedSuiteVersion - Optional suite version from UI state (takes priority)
	 * @returns {object} Object with goldenConfigApps, regularApps, and suite metadata
	 */
getUpgradeAppListWithSplit: function(upgradePlanSysId, upgradePreviewSysId, upgradeSessionId, selectedSuiteVersion, sessionType) {
    var result = this.getUpgradeAppList(upgradePlanSysId, upgradePreviewSysId, sessionType, upgradeSessionId);
    var appsObject = {};
    for (var i = 0; i < result.apps.length; i++) {
        var app = result.apps[i];
        appsObject[app.scope] = app;
    }

    var splitResult = this._splitAppsIntoGoldenAndRegular(appsObject, upgradeSessionId, selectedSuiteVersion);
    return {
        goldenConfigApps: splitResult.goldenConfigApps,  
        regularApps: splitResult.regularApps,  
        allApps: result.apps,  
        successUpgrades: result.successUpgrades,
        successNewInstalls: result.successNewInstalls,
        suiteVersions: splitResult.suiteVersions,
        selectedSuite: splitResult.selectedSuite,
        latestSuite: splitResult.latestSuite,
        installedSuite: splitResult.installedSuite
    };
},
/**
 * Gets the selected suite version from the upgrade session config.
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
        var savedVersion = gr.getValue('selected_suite_version');
        if (savedVersion) {
            gs.info("PostStoreAppsFlowUtil: Retrieved saved suite version: " + savedVersion);
        }
        return savedVersion;
    }
    
    gs.warn("PostStoreAppsFlowUtil: Session not found: " + upgradeSessionId);
    return null;
},

/**
 * Saves the selected suite version to the upgrade session config.
 *
 * @param {String} upgradeSessionId - The upgrade session sys_id
 * @param {String} suiteVersion - The suite version to save
 * @returns {Boolean} True if successful, false otherwise
 */
setSelectedSuiteVersionInConfig: function(upgradeSessionId, suiteVersion) {
    if (!upgradeSessionId || !suiteVersion) {
        gs.error("PostStoreAppsFlowUtil: setSelectedSuiteVersionInConfig - Missing required parameters");
        return false;
    }

    var gr = new GlideRecord('sn_um_upgrade_sessions');
    if (gr.get(upgradeSessionId)) {
        gr.setValue('selected_suite_version', suiteVersion);
        gr.update();
        gs.info("PostStoreAppsFlowUtil: Updated selected_suite_version to " + suiteVersion + " for session " + upgradeSessionId);
        return true;
    }

    gs.error("PostStoreAppsFlowUtil: setSelectedSuiteVersionInConfig - Session not found: " + upgradeSessionId);
    return false;
},

    type: 'PostStoreAppsFlowUtil'
};
