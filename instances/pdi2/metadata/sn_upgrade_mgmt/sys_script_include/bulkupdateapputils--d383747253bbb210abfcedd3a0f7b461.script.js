var BulkUpdateAppUtils = Class.create();
BulkUpdateAppUtils.prototype = {
    initialize: function() {
        this.globalUmUtil = new global.UpgradeManagementApiUtil();
        this.versionComparator = new sn_appclient.VersionComparator();
    },

    /**
     * Returns the current server time formatted for the schedule picker.
     * Used by the schedule modal to set the picker's `min` so users cannot
     * pick a time in the past.
     *
     * @param {Number} bufferMinutes - cushion to add so submits don't fail at the edge. Default 5.
     * @returns {Object} { epochMs, displayLocal, timezoneAbbr }
     *   - epochMs:      numeric value, bind to picker.min
     *   - displayLocal: profile-tz wall-clock string, use in hint copy
     *   - timezoneAbbr: "EDT" / "EST" — for label
     */
    getCurrentTime: function(bufferMinutes) {
        var gdt = new GlideDateTime();
        gdt.addSeconds((bufferMinutes || 5) * 60);
        return {
            epochMs: gdt.getNumericValue(),
            displayLocal: gdt.getDisplayValue()
        };
    },

    /**
     * Gets the count of store apps and NowAssist (suite config) apps in the upgrade plan.
     * Counts every active sys_upgrade_plan_item, classified by suite-config membership.
     * Same-version no-ops are intentionally included — the platform install path
     * (sn_appclient.AppManagerHandler via UpgradeManagementApiUtil.installAppsForProduct)
     * short-circuits same-version installs, so a stable plan-intent count beats a count
     * that drifts downward as updates complete.
     *
     * @param {String} upgradeSessionId - The sn_um_upgrade_sessions sys_id
     * @returns {Object} { storeAppsNewInstallCount, nowAssistAppsNewInstallCount, totalNewInstallCount }
     */
    getNewInstallAppCounts: function(upgradeSessionId) {
        var resultObj = {
            storeAppsNewInstallCount: 0,
            nowAssistAppsNewInstallCount: 0,
            totalNewInstallCount: 0,
            batchInstallationSchedule: "",
            batchInstallationScheduleTime: "",
            batchInstallExecutionTracker: "",
            batchInstallExecutionTrackerStartTime: "",
            batchInstallExecutionTrackerProgress: 0
        };

        if (!upgradeSessionId) {
            gs.error("getNewInstallAppCounts: upgradeSessionId is required");
            return resultObj;
        }

        var sessionGR = new GlideRecord("sn_um_upgrade_sessions");
        if (!sessionGR.get(upgradeSessionId)) {
            gs.error("getNewInstallAppCounts: Upgrade session not found: " + upgradeSessionId);
            return resultObj;
        }

        var upgradePlanSysId = sessionGR.getValue("upgrade_plan");
        var selectedSuiteVersion = sessionGR.getValue("selected_suite_version");
        var installationSchedule = sessionGR.getValue("batch_app_install_schedule");
        var installationTracker = sessionGR.getValue("batch_app_install_execution_tracker");

        if (!upgradePlanSysId) {
            gs.error("getNewInstallAppCounts: No upgrade plan found on session: " + upgradeSessionId);
            return resultObj;
        }

        // 1. Collect active plan-item scopes
        var grPlanItem = new GlideRecord("sys_upgrade_plan_item");
        grPlanItem.addQuery("upgrade_plan", upgradePlanSysId);
        grPlanItem.addQuery("active", true);
        grPlanItem.query();

        var planItemScopeList = [];
        while (grPlanItem.next()) {
            planItemScopeList.push(grPlanItem.getValue("scope"));
        }

        if (planItemScopeList.length === 0) {
            return resultObj;
        }

        // 2. Build set of suite-config scopes for the selected suite version
        var suiteScopes = {};
        if (selectedSuiteVersion && selectedSuiteVersion !== "None") {
            var grSuiteConfig = new GlideRecord("sn_um_incoming_suite_config");
            grSuiteConfig.addQuery("version", selectedSuiteVersion);
            grSuiteConfig.query();
            if (grSuiteConfig.next()) {
                var grM2M = new GlideRecord("sn_um_incoming_suite_config_app_version_m2m");
                grM2M.addQuery("suite_config", grSuiteConfig.getValue("sys_id"));
                grM2M.query();
                while (grM2M.next()) {
                    suiteScopes[grM2M.getValue("app_scope")] = true;
                }
            }
        }

        // 3. Classify every plan item by suite membership
        for (var i = 0; i < planItemScopeList.length; i++) {
            if (suiteScopes[planItemScopeList[i]]) {
                resultObj.nowAssistAppsNewInstallCount++;
            } else {
                resultObj.storeAppsNewInstallCount++;
            }
        }

        resultObj.totalNewInstallCount = resultObj.storeAppsNewInstallCount + resultObj.nowAssistAppsNewInstallCount;
        resultObj.batchInstallationSchedule = installationSchedule || "";
        resultObj.batchInstallExecutionTracker = installationTracker || "";

        // Fetch schedule start time if schedule exists
        if (installationSchedule) {
            var scheduleGR = new GlideRecord("sys_installation_schedule");
            if (scheduleGR.get(installationSchedule)) {
                resultObj.batchInstallationScheduleTime = scheduleGR.getDisplayValue("start_time") || "";
            }
        }

        // Fetch execution tracker start time if tracker exists
        if (installationTracker) {
            var trackerGR = new GlideRecord("sys_execution_tracker");
            if (trackerGR.get(installationTracker)) {
                resultObj.batchInstallExecutionTrackerStartTime = trackerGR.getDisplayValue("start_time") || "";
                resultObj.batchInstallExecutionTrackerProgress = trackerGR.getValue("percent_complete");
            }
        }

        return resultObj;
    },

    /**
     * Creates a scheduled batch installation from active upgrade plan items
     * via the sn_appclient schedule API. Schedules each app individually and
     * updates batch_app_install_schedule on the upgrade session.
     *
     * @param {String} upgradeSessionId - sys_id of the sn_um_upgrade_sessions record
     * @param {String} startTime - Schedule start datetime in yyyy/MM/dd hh:mm:ss a format (e.g. "2026/05/15 10:00:00 AM")
     * @returns {Object} { success: Boolean, scheduleId: String, error: String, packageCount: Number }
     */
    scheduleBatchInstallFromUpgradePlan: function(upgradeSessionId, startTime) {
        var resultObj = {
            success: false,
            error: "",
            scheduleId: "",
            packageCount: 0,
            startTime: ""
        };
        if (!upgradeSessionId) {
            gs.error("scheduleBatchInstallFromUpgradePlan: upgradeSessionId is required");
            resultObj.error = "upgradeSessionId is required"
            return resultObj;
        }

        if (!startTime) {
            gs.error("scheduleBatchInstallFromUpgradePlan: startTime is required");
            resultObj.error = "startTime is required"
            return resultObj;
        }

        // 1. Fetch upgrade session
        var sessionGR = new GlideRecord("sn_um_upgrade_sessions");
        if (!sessionGR.get(upgradeSessionId)) {
            gs.error("scheduleBatchInstallFromUpgradePlan: Upgrade session not found: " + upgradeSessionId);
            resultObj.error = "Upgrade session not found: " + upgradeSessionId;
            return resultObj;
        }

        var upgradePlanSysId = sessionGR.getValue("upgrade_plan");
        if (!upgradePlanSysId) {
            gs.error("scheduleBatchInstallFromUpgradePlan: No upgrade plan on session: " + upgradeSessionId);
            resultObj.error = "No upgrade plan found on session";
            return resultObj;
        }

        // 2. Get all active plan items
        var grPlanItem = new GlideRecord("sys_upgrade_plan_item");
        grPlanItem.addQuery("upgrade_plan", upgradePlanSysId);
        grPlanItem.addQuery("active", true);
        grPlanItem.query();

        var planItems = [];
        while (grPlanItem.next()) {
            planItems.push({
                id: grPlanItem.getValue("id"),
                name: grPlanItem.getValue("name"),
                scope: grPlanItem.getValue("scope"),
                version: grPlanItem.getValue("version")
            });
        }

        if (planItems.length === 0) {
            gs.info("scheduleBatchInstallFromUpgradePlan: No active plan items for session: " + upgradeSessionId);
            resultObj.error = "No active upgrade plan items found";
            return resultObj;
        }

        // 3. Check for existing schedule on the session
        var existingScheduleId = sessionGR.getValue("batch_app_install_schedule") || "";

        // 4. Build list_of_apps, passing existing schedule_id if present
        var listOfApps = [];
        for (var i = 0; i < planItems.length; i++) {
            var item = planItems[i];
            var appEntry = {
                name: item.name,
                scope: item.scope,
                source_app_id: item.id,
                version: String(item.version),
                is_store_app: true
            };
            if (existingScheduleId) {
                appEntry.schedule = {
                    schedule_id: existingScheduleId
                };
            }
            listOfApps.push(appEntry);
        }

        // 5. Schedule all apps at once
        try {
            var scheduleResult = this.globalUmUtil.scheduleUpdateForTheApp({
                name: "Schedule Batch Installation Plan",
                start_time: startTime,
                list_of_apps: listOfApps,
                schedule: existingScheduleId ? {
                    schedule_id: existingScheduleId
                } : undefined,
                additional_args: {
                    name: "UpgradeManagementConsoleBatchSchedule",
                    id: upgradeSessionId,
                    type: "application"
                }
            });

            // 6. Parse response to extract schedule_id from list_of_apps
			// Note: scheduleUpdateForTheApp's response start_time is unreliable;
            // we read the authoritative start_time from sys_installation_schedule below.
            var newScheduleId = "";
            if (scheduleResult) {
                var parsed = typeof scheduleResult === "string" ? JSON.parse(scheduleResult) : scheduleResult;
                var resultData = parsed.result || parsed;
                var resultApps = resultData.list_of_apps || [];
                if (resultApps.length > 0 && resultApps[0].schedule_id) {
                    newScheduleId = resultApps[0].schedule_id;
                }
            }

            // 7. Update session with the new schedule_id
			var scheduleStartDisplay = "";
            if (newScheduleId) {
                sessionGR.setValue("batch_app_install_schedule", newScheduleId);
                sessionGR.update();

				var scheduleGR = new GlideRecord("sys_installation_schedule");
                if (scheduleGR.get(newScheduleId)) {
                    var scheduledGdt = new GlideDateTime();
                    scheduledGdt.setValue(scheduleGR.getValue("start_time"));   // canonical UTC
                    scheduleStartDisplay = scheduledGdt.getDisplayValue();      // profile-tz wall-clock

					// Fire a scheduled event to coincide with when the batch install will execute
					gs.eventQueueScheduled(
						"sn_upgrade_mgmt.batch_install_scheduled",
						sessionGR,
						upgradeSessionId,
						newScheduleId,
						scheduledGdt
					);
				} else {
                    gs.warn("scheduleBatchInstallFromUpgradePlan: sys_installation_schedule record not found for id: " + newScheduleId);
                }
            }

            gs.info("scheduleBatchInstallFromUpgradePlan: Scheduled " + listOfApps.length + " apps. Schedule ID: " + newScheduleId);

            resultObj.success = true;
            resultObj.startTime = scheduleStartDisplay;
            resultObj.scheduleId = newScheduleId;
            resultObj.packageCount = listOfApps.length;
            return resultObj;
        } catch (e) {
            gs.error("scheduleBatchInstallFromUpgradePlan: Error - " + e);
            return {
                success: false,
                error: String(e),
                packageCount: listOfApps.length
            };
        }
    },

    /**
     * Deletes the scheduled batch application installation associated with an upgrade session.
     * Retrieves the upgrade session by ID, reads the batch install schedule reference
     * from the session record, and invokes the global utility to delete that schedule.
     *
     * @param {String} upgradeSessionId - The sys_id of the sn_um_upgrade_sessions record whose schedule should be deleted.
     * @returns {Object} { success, error } - success is true if the schedule was deleted, error contains a message on failure.
     */
    deleteScheduleInstall: function(upgradeSessionId) {
        gs.info("deleteScheduleInstall: Called with upgradeSessionId=" + upgradeSessionId);

        var resultObj = {
            success: false,
            error: null
        };

        if (!upgradeSessionId) {
            gs.error("deleteScheduleInstall: upgradeSessionId is required");
            resultObj.error = "upgradeSessionId is required";
            return resultObj;
        }

        // 1. Fetch upgrade session
        var sessionGR = new GlideRecord("sn_um_upgrade_sessions");
        if (!sessionGR.get(upgradeSessionId)) {
            gs.error("deleteScheduleInstall: Upgrade session not found: " + upgradeSessionId);
            resultObj.error = "Upgrade session not found: " + upgradeSessionId;
            return resultObj;
        }

        // 2. Fetch schedule for batch installation
        var batchInstallSchedule = sessionGR.getValue("batch_app_install_schedule");
        if (!batchInstallSchedule) {
            gs.error("deleteScheduleInstall: No batch_app_install_schedule on session: " + upgradeSessionId);
            resultObj.error = "No batch install schedule found on session";
            return resultObj;
        }

        // 3. Delete the schedule
        var response, parsed;
        try {
            response = this.globalUmUtil.deleteScheduleUpdateForTheApp(batchInstallSchedule);
            parsed = JSON.parse(response);
        } catch (e) {
            gs.error("deleteScheduleInstall: Failed to parse response for schedule " + batchInstallSchedule + ": " + e.message);
            resultObj.error = "Unexpected response from deleteScheduleUpdateForTheApp";
            return resultObj;
        }

        // 4. Build result
        if (parsed && parsed.success) {
            gs.info("deleteScheduleInstall: Schedule deleted successfully: " + batchInstallSchedule);
            resultObj.success = true;
        } else {
            gs.error("deleteScheduleInstall: Delete failed for schedule: " + batchInstallSchedule);
            resultObj.error = "Failed to delete schedule: " + batchInstallSchedule;
        }
        return resultObj;
    },

    /**
     * Immediately installs apps from the upgrade plan by calling the
     * product/install API via global.UpgradeConsoleGlobalUtils.installAppsForProduct().
     * Sends all packages in one call so the platform creates a single
     * sn_appclient_progress_tracker with one tracker_id for aggregate progress.
     * Updates batch_app_install_execution_tracker on the session.
     *
     * @param {String} upgradeSessionId - sys_id of the sn_um_upgrade_sessions record
     * @returns {Object} { success, trackerId, error, packageCount }
     */
    installAppsFromUpgradePlan: function(upgradeSessionId) {
        var resultObj = {
            success: false,
            error: "",
            trackerId: "",
            packageCount: 0
        };

        if (!upgradeSessionId) {
            gs.error("installAppsFromUpgradePlan: upgradeSessionId is required");
            resultObj.error = "upgradeSessionId is required";
            return resultObj;
        }



        // 1. Fetch upgrade session
        var sessionGR = new GlideRecord("sn_um_upgrade_sessions");
        if (!sessionGR.get(upgradeSessionId)) {
            gs.error("installAppsFromUpgradePlan: Upgrade session not found: " + upgradeSessionId);
            resultObj.error = "Upgrade session not found: " + upgradeSessionId;
            return resultObj;
        }

        var existingSchedule = sessionGR.getValue("batch_app_install_schedule");
        if (existingSchedule) {
            var deleteResult = this.deleteScheduleInstall(upgradeSessionId);
            if (!deleteResult.success) {
                gs.warn("installAppsFromUpgradePlan: Failed to delete existing schedule: " + deleteResult.error + ". Proceeding with install.");
            } else {
                sessionGR.setValue("batch_app_install_schedule", "");
                sessionGR.update();
            }
        }

        var upgradePlanSysId = sessionGR.getValue("upgrade_plan");
        if (!upgradePlanSysId) {
            gs.error("installAppsFromUpgradePlan: No upgrade plan on session: " + upgradeSessionId);
            resultObj.error = "No upgrade plan found on session";
            return resultObj;
        }

        // 2. Get all active plan items
        var grPlanItem = new GlideRecord("sys_upgrade_plan_item");
        grPlanItem.addQuery("upgrade_plan", upgradePlanSysId);
        grPlanItem.addQuery("active", true);
        grPlanItem.query();

        var planItems = [];
        var planItemScopeList = [];
        while (grPlanItem.next()) {
            planItems.push({
                id: grPlanItem.getValue("id"),
                name: grPlanItem.getValue("name"),
                scope: grPlanItem.getValue("scope"),
                version: grPlanItem.getValue("version")
            });
            planItemScopeList.push(grPlanItem.getValue("scope"));
        }

        if (planItems.length === 0) {
            gs.info("installAppsFromUpgradePlan: No active plan items for session: " + upgradeSessionId);
            resultObj.error = "No active upgrade plan items found";
            return resultObj;
        }

        // 3. Get currently installed app versions to filter
        var installedApps = {};
        var grStoreApp = new GlideRecord("sys_store_app");
        grStoreApp.addQuery("scope", "IN", planItemScopeList.join(","));
        grStoreApp.addQuery("active", true);
        grStoreApp.query();
        while (grStoreApp.next()) {
            installedApps[grStoreApp.getValue("scope")] = grStoreApp.getValue("version");
        }

        // 4. Build packages list — only apps that need install or upgrade
        var versionComparator = this.versionComparator || new sn_appclient.VersionComparator();
        var packages = [];
        for (var i = 0; i < planItems.length; i++) {
            var item = planItems[i];
            var installedVersion = installedApps[item.scope];
            var shouldInclude = false;

            if (!installedVersion) {
                shouldInclude = true;
            } else if (versionComparator.isUpgrade(installedVersion, item.version)) {
                shouldInclude = true;
            }

            if (shouldInclude) {
                packages.push({
                    id: item.id,
                    type: "application",
                    load_demo_data: false,
                    name: item.name,
                    scope: item.scope,
                    installed_version: installedVersion || "Not Installed",
                    requested_version: String(item.version)
                });
            }
        }

        if (packages.length === 0) {
            gs.info("installAppsFromUpgradePlan: All apps are up to date for session: " + upgradeSessionId);
            resultObj.success = true;
            resultObj.packageCount = 0;
            return resultObj;
        }

        // 5. Build payload and call product/install via global utility
        //    Uses global scope for RESTMessageV2 auth to localhost
        var payload = {
            name: "UpgradeManagementConsoleBatchUpdate",
            product_id: "UpgradeManagementConsoleBatchUpdate-" + new GlideDateTime().getNumericValue(),
            packages: packages
        };

        try {
            var responseBody = this.globalUmUtil.installAppsForProduct(payload);

            // 6. Parse response to extract tracker ID
            var parsed = JSON.parse(responseBody);
            var result = parsed.result || parsed;
            var batchInfo = result.batchInfo || {};
            var trackerId = result.trackerId || batchInfo.execution_tracker_id || result.execution_tracker_id || "";

            // 7. Update session with the execution tracker
            if (trackerId) {
                sessionGR.setValue("batch_app_install_execution_tracker", trackerId);
                sessionGR.update();
            }

            gs.info("installAppsFromUpgradePlan: Installed " + packages.length + " apps. Tracker ID: " + trackerId);
            resultObj.success = true;
            resultObj.trackerId = trackerId;
            resultObj.packageCount = packages.length;
            return resultObj;
        } catch (e) {
            gs.error("installAppsFromUpgradePlan: Error - " + e);
            resultObj.error = String(e);
            return resultObj;
        }
    },

    type: 'BulkUpdateAppUtils'
};
