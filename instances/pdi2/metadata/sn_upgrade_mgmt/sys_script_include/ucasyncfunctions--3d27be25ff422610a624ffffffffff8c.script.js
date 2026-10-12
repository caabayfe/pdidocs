var UCAsyncFunctions = Class.create();
UCAsyncFunctions.prototype = {
    initialize: function() {
        this.globalUmUtil = new global.UpgradeManagementApiUtil();
    },
    
    fetchIncomingStoreApps: function(targetPatchId, upgradeSessionId) {
		var currentTracker = GlideExecutionTracker.getLastRunning();
        try {
            var allApps = new sn_uc.UpgradeMgmtUtil.getAllApplications(targetPatchId);
            if (allApps.allApplications === "null")
                throw new Error("Store connection error");

            var apiResponse = JSON.parse(allApps.allApplications);

            var tables = ["sn_um_incoming_app_version", "sn_um_incoming_app"];

            for (var i = 0; i < tables.length; i++) {
                this.globalUmUtil.truncateStoreTable(tables[i]);
                gs.info("All records deleted from " + tables[i]);
            }

            apiResponse.forEach(function(app) {
                if (!app.is_store_app) {
                    return; // Skip non-store apps
                }

                // Insert into sn_um_incoming_app (latest version)
                var grIncomingApp = new GlideRecord("sn_um_incoming_app");
                grIncomingApp.initialize();
                grIncomingApp.setValue("app_name", app.app_name);
                grIncomingApp.setValue("scope", app.scope);
                //grIncomingApp.setValue("latest_version", app.latest_version); // Highest version from API - api giving wrong - not as target version - could be even higher also
                grIncomingApp.setValue("action", "Upgraded"); // Assuming upgrade, can modify as needed
                grIncomingApp.setValue("target_patch_id", targetPatchId);
                grIncomingApp.setValue("sys_code", app.sys_code);
                grIncomingApp.setValue("source_app_id", app.source_app_id); // Sys ID of the application
                var highestVersion = "";
                var highestVersionDependencies = "";

                // Insert all available versions into sn_um_incoming_app_version
                app.versions.forEach(function(version) {
                    if (highestVersion === "") {
                        highestVersion = version.version;
                        highestVersionDependencies = version.dependencies;
                    } else if (new sn_appclient.VersionComparator().isUpgrade(highestVersion, version.version)) {
                        highestVersion = version.version;
                        highestVersionDependencies = version.dependencies;
                    }

                    var grAppVersion = new GlideRecord("sn_um_incoming_app_version");
                    grAppVersion.initialize();
                    grAppVersion.setValue("app_name", app.app_name);
                    grAppVersion.setValue("scope", app.scope);
                    grAppVersion.setValue("version", version.version);
                    grAppVersion.setValue("compatibilities", version.compatibilities);
                    grAppVersion.setValue("dependencies", version.dependencies);
                    grAppVersion.setValue("target_patch_id", targetPatchId);
                    grAppVersion.insert();
                });
                grIncomingApp.setValue("latest_version", highestVersion);
                grIncomingApp.setValue("dependencies", highestVersionDependencies);
                grIncomingApp.insert();
            });

            // Sync suite versions from store
			var targetPlatformVersion = null;
			if (upgradeSessionId) {
				var grSession = new GlideRecord("sn_um_upgrade_sessions");
				if (grSession.get(upgradeSessionId)) {
					targetPlatformVersion = grSession.getValue("target_platform_version");
				}
			}
            if (targetPlatformVersion) {
                gs.info("Syncing suite versions for platform: " + targetPlatformVersion);
                new sn_upgrade_mgmt.TargetSuiteConfigProcessor().processSuiteConfigs(targetPlatformVersion);
            } else {
                gs.warn("Could not retrieve platform version for syncing suite configs");
            }

        } catch (err) {
            // mark worker as failed error
			currentTracker.fail(JSON.stringify(err));
            // var gr = new GlideRecord("sn_um_upgrade_sessions");
            // if (gr.get(upgradeSessionId)) {
            //     var storeTracker = gr.getValue('store_incoming_apps_exec_tracker');
            //     var ex = new GlideExecutionTracker(storeTracker);
            //     ex.fail();
            // }

        }  
    },
    getLastCloneSummary: function() {
        var tableName = 'sn_um_lastclone_summary';
        var grInsert = new GlideRecord(tableName);
        grInsert.initialize();

        try {
            var INSTANCE_NAME = gs.getProperty("instance_name");
            var SERVER_URL = gs.getProperty("sn_upgrade_mgmt.cloneinfoserver");
            var PATH = "/api/snc/cloneupgradeconsole/getCloneContextDetails";

            var request = new sn_internal_services.ServiceRESTMessage(SERVER_URL);
            request.setPath(PATH);
            request.setHttpMethod('GET');
            request.setQueryParameter('instanceNames', INSTANCE_NAME);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader('X-KaaUserClaim', "d3MuY2xvbmUua2Fh"); // Base64 encoding of ws.clone.kaa
            request.setIdentityCertificateMutualAuth(true);

            var response = request.execute();
            var responseJson = JSON.parse(response.getBody());

            if (!responseJson || !responseJson.result) {
                throw new Error('Unknown Error Occured');
            } else if (responseJson.result.isError) {
                throw new Error(responseJson.result.message);
            }

            var cloneContext = responseJson.result.clnContext[0];

            grInsert.start_time = cloneContext.startTime;
            grInsert.end_time = cloneContext.endTime;
            grInsert.source_instance = cloneContext.sourceInstance;
            grInsert.target_instance = cloneContext.targetInstance;
            grInsert.state = cloneContext.state;
            grInsert.is_fetch_error = false;

            return grInsert.insert();

        } catch (e) {
            gs.error(e);

            grInsert.is_fetch_error = true;
            return grInsert.insert();
        }
    },
	// Function to update the sn_um_app_state_preview table with data from getPreviewAppList
	preserveData: function(targetPatchId, upgradePlanSysId, upgradePreviewSysId) {
		try {
			new global.UpgradeManagementApiUtil().truncateStoreTable("sn_um_app_state_preview");
			
			// Query for the active upgrade session ID
			var upgradeSessionId = null;
			var grSession = new GlideRecord("sn_um_upgrade_sessions");
			grSession.addQuery("status", "in_progress");
			grSession.orderByDesc("sys_created_on");
			grSession.setLimit(1);
			grSession.query();
			if (grSession.next()) {
				upgradeSessionId = grSession.getValue("sys_id");
				gs.info("Found active upgrade session for preserveData: " + upgradeSessionId);
			}
			
			// Use the split method to get apps with suite_version property populated
			var splitResult = new sn_upgrade_mgmt.StoreAppsFlowUtils().getPreviewAppListWithSplit(targetPatchId, upgradePlanSysId, upgradePreviewSysId, upgradeSessionId);
			// Preserve only the filtered apps (regularApps + goldenConfigApps), not allApps.
			// For bulk_app_update sessions, regularApps is filtered to store apps with updates only,
			// so we must not use allApps which contains the unfiltered set.
			var appsToPreserve = {};
			var regularApps = splitResult.regularApps || {};
			var goldenConfigApps = splitResult.goldenConfigApps || {};
			for (var rScope in regularApps) {
				appsToPreserve[rScope] = regularApps[rScope];
			}
			for (var gScope in goldenConfigApps) {
				appsToPreserve[gScope] = goldenConfigApps[gScope];
			}
			var gr = new GlideRecord('sn_um_app_state_preview');


			// Process each app from the result
			for (var scope in appsToPreserve) {
				var app = appsToPreserve[scope];
				gr.initialize();

				gr.setValue('app_name', app.app_name);
				gr.setValue('scope', scope);
				gr.setValue('installed_version', app.installed_version);
				gr.setValue('latest_available_version', app.latest_available_version);
				gr.setValue('upgradable_versions', JSON.stringify(app.upgradable_versions));
				gr.setValue('selected', app.selected);
				gr.setValue('true_up_version', app.true_up_version);
				gr.setValue('app_sys_id', app.sys_code); // sys_code from getPreviewAppList maps to app_sys_id
				gr.setValue('state', app.state);
				gr.setValue('status_message', app.status_message);
				
				gr.insert();
			}
			
			return {
				success: true,
				message: "Successfully updated sn_um_app_state_preview with data from getPreviewAppList"
			};
		} catch (e) {
			gs.error("Error updating sn_um_app_state_preview: " + JSON.stringify(e));
			return {
				success: false,
				message: "Error updating sn_um_app_state_preview"
			};
		}
	},
	
	
    type: 'UCAsyncFunctions'
};
