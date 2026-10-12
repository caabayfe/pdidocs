var UpgradeManagementApiUtil = Class.create();
UpgradeManagementApiUtil.prototype = {
    initialize: function() {
        this.versionComparator = new sn_appclient.VersionComparator(); // Create once
    },
	createChildTrackerForTriageApi: function(testResultID) {
		try {
			var childTracker = SNC.GlideExecutionTracker.stageNew(gs.getMessage("Processing test result"));
			childTracker.setSourceTable("sys_atf_test_result");
			childTracker.setSource(testResultID);
			childTracker.stage();
			return childTracker.getSysID();
		} catch(error) {
			gs.error("Unable to createChildTrackerForTriageApi due to error" + error);
		}
	},
	cancelTriageExecutionTrackers: function(trackerID) {
		try {
			var tracker = SNC.GlideExecutionTracker.getBySysID(trackerID);
			tracker.cancel();

			// Cancel all child trackers
			var childTrackers = new GlideRecord("sys_execution_tracker");
			childTrackers.addQuery("parent", trackerID);
			childTrackers.addQuery("state", "IN", "0,1"); // Pending or Running
			childTrackers.query();
			
			while (childTrackers.next()) {
				var childTracker = SNC.GlideExecutionTracker.getBySysID(childTrackers.getUniqueValue());
				childTracker.cancel();
			}

		} catch(error) {
			gs.error("Unable to cancelTriage due to error" + error);
		}
	},
	updateParentTracker: function(parentGR, parentMessage) {
		try {
			parentGR.setValue("state", 2);
			parentGR.setValue("percent_complete", 100);
			parentGR.setValue("message", parentMessage);
			parentGR.setValue("completion_time", new GlideDateTime());
			parentGR.update();
		} catch (e) {
			gs.error("[ATFAssistUtil] Error checking/updating parent completion: " + e);
		}
	},

	updateChildTracker: function(options) {
		if (!options)
			options = {};

		var result = { success: false };
		try {
			if(!options.testTrackerID) {
				gs.warn("[ATFAssistUtil] No testTrackerID found");
				return result;
			}
			var childTracker = SNC.GlideExecutionTracker.getBySysID(options.testTrackerID);
			if (options.state && options.state == "1") {
				// Output not found - mark tracker as failed
				childTracker.updateMessage(gs.getMessage("Triage completed but output not found"));
				childTracker.fail();
				gs.warn("[ATFAssistUtil] Marked tracker as failed (output not found)");
				result.success = true;
			} else if (options.state && options.state == "0") {
				// Output found - mark tracker as successful
				childTracker.updateMessage(gs.getMessage("Triage completed with output verified"));
				childTracker.success();
				gs.info("[ATFAssistUtil] Marked tracker as successful (output verified)");
				result.success = true;
			} 
		} catch (e) {
			gs.error("Unable to updateChildTracker due to error"+ e);
			result.error = e.message || e;
		}
		return result;

	},

	/**
	 * Triage multiple test results in batches using 4 sys_trigger jobs
	 * Creates a parent execution tracker that is updated after each individual test is triaged
	 *
	 * @param {*} options Options for the call, the following options are supported:
	 * -testResultIDs: Array of sys_atf_test_result sys_ids to triage
	 *
	 * @returns An object with the following properties:
	 * -success: True if the call was successful
	 * -parentTrackerID: Sys ID of the parent execution tracker
	 */
	createTrackers: function(options) {
		if (!options)
			options = {};

		var result = { success: false };

		try {
			var testResultIDs  = options.testResultIDs || [];
			var upgradeSessionID  = options.upgradeSessionID || "";

			if (testResultIDs.length == 0) {
				gs.warn("[ATFAssistUtil] No testResultIDs found");
				return result;
			}

			if (!upgradeSessionID) {
				gs.warn("[ATFAssistUtil] No upgradeSessionID found");
				return result;
			}
			
			// Create parent execution tracker
			var parentTracker = SNC.GlideExecutionTracker.stageNew(gs.getMessage("Triaging multiple tests"));
			parentTracker.setSourceTable("sys_atf_test_result");
			parentTracker.run();
			var parentTrackerID = parentTracker.getSysID();
			gs.info("[ATFAssistUtil] Created parent tracker: " + parentTrackerID);
			
			// Create all child execution trackers upfront and link to parent
			// This allows ServiceNow to automatically update parent progress as children complete
			gs.info("[ATFAssistUtil] Creating " + testResultIDs.length + " child execution trackers...");
			var testTrackerMap = {};  // Map of testResultID -> trackerID
			var childTrackerIDs = [];  // Array to collect all child tracker IDs
			
			// Step 1: Create all child trackers
			for (var i = 0; i < testResultIDs.length; i++) {
				var testResultID = testResultIDs[i];
				
				// Create child tracker
				var childTracker = SNC.GlideExecutionTracker.stageNew(gs.getMessage("Processing test result"));
				childTracker.setSourceTable("sys_atf_test_result");
				childTracker.setSource(testResultID);
				childTracker.stage();
				var childTrackerID = childTracker.getSysID();
				
				// Store mapping and collect ID
				testTrackerMap[testResultID] = childTrackerID;
				childTrackerIDs.push(childTrackerID);
			}
			
			gs.info("[ATFAssistUtil] Created " + testResultIDs.length + " child trackers");
			
			// Step 2: Link all child trackers to parent in batches to avoid query length limits
			// Process in batches of 100 to stay well within ServiceNow limits
			var linkBatchSize = 100;
			
			for (var batchStart = 0; batchStart < childTrackerIDs.length; batchStart += linkBatchSize) {
				var batchEnd = Math.min(batchStart + linkBatchSize, childTrackerIDs.length);
				var batchIDs = childTrackerIDs.slice(batchStart, batchEnd);
				
				var childGR = new GlideRecord("sys_execution_tracker");
				childGR.addQuery("sys_id", "IN", batchIDs.join(","));
				childGR.setValue("parent", parentTrackerID);
				childGR.setValue("propagate_error_to_parent", false);
				childGR.updateMultiple();
				
				gs.info("[ATFAssistUtil] Linked batch of " + batchIDs.length + "child trackers " + (batchStart + 1-batchEnd) +  "to parent");
			}

			result.success = true;
			result.parentTrackerID = parentTrackerID;
			result.testTrackerMap = testTrackerMap;

		} catch (e) {
			gs.error("Unable to triage multiple tests due to error" + e);
			result.error = e.message || e;
		}

		return result;
	},

    getPredictedSkippedRecordsUrl: function() {
        try {
            return "now/nav/ui/classic/params/target/upgrade_preview_log_list";

            //var upgradeMonitorStatusProviderDetails = new SNC.UpgradeMonitorStatusProvider().getStatus("");

            //var parsedResponse = JSON.parse(upgradeMonitorStatusProviderDetails);

            //if(parsedResponse && parsedResponse.fromVersion && parsedResponse.toVersion) {
            //  var predictedSkipsUrl = new sn_uc.UpgradeMgmtUtil.getTotalPredictedSkipsUrl(parsedResponse.fromVersion, parsedResponse.toVersion);  
            //  return (predictedSkipsUrl && predictedSkipsUrl.totalPredictedSkipsUrl) || "now/nav/ui/classic/params/target/upgrade_preview_log_list";
            //}
        } catch (error) {
            gs.info("Error" + error);
        }

    },

    getSkippedRecordsUrl: function() {
        try {
            var upgradeMonitorStatusProviderDetails = new SNC.UpgradeMonitorStatusProvider().getStatus("");
            var parsedResponse = JSON.parse(upgradeMonitorStatusProviderDetails);
            return (parsedResponse && parsedResponse.upgradeHistoryDetails && parsedResponse.upgradeHistoryDetails[0] && parsedResponse.upgradeHistoryDetails[0].skippedAllRecordsUrl) || "now/nav/ui/classic/params/target/sys_upgrade_history_log_list";
        } catch (error) {
            gs.info("Error" + error);
        }

    },

    updateUpgradeSessionConfigValues: function(sys_id, value) {
        try {
            var sessionGR = new GlideRecord("sn_um_upgrade_session_config");
            sessionGR.get(sys_id);
            sessionGR.setValue("setting_value", value);
            sessionGR.update();
        } catch (error) {
            gs.info("Error" + error);
        }
    },
	getBoqState: function(boqId) {
        var gr = new GlideRecord('sn_atf_tg_sn_boq');
        if (gr.get(boqId)) {
            var state = gr.getValue('state');
            var progress = gr.getValue('progress');
            var result = {};
            result['state'] = state;
            result['progress'] = progress;
            return result;
        } else {
            gs.info('Record not found for boqId: ' + boqId);
            return null;
        }
    },
    getTestSuiteId: function(sessionId) {
        var gr = new GlideRecord('sn_um_upgrade_sessions');
        gr.addQuery('sys_id', sessionId);
        gr.query();
        var result = {
            boqId: '',
            state: '',
            progress: ''
        };
        var boqId = null;
        if (gr.next()) {
            boqId = gr.atf_test_suite_generation_tracker;
        }
        if (boqId) {
            var gp = new GlideRecord('sn_atf_tg_sn_boq');
            gp.get(boqId);
            var gdt = new GlideDateTime(gp.sys_created_on);
			var created = gdt.getDisplayValue();
            var state = this.getBoqState(boqId).state;
            var progress = this.getBoqState(boqId).progress;
            result = {
                boqId: boqId,
                state: state,
                progress: progress,
                created: created
            };
        }
        return result;
    },

    freeBoqFromSession: function(sessionId) {
	    var result = false;
	    
	    var gr = new GlideRecord('sn_um_upgrade_sessions');
	    if (gr.get(sessionId)) {
	
	        var generationTracker = gr.getValue("atf_test_suite_generation_tracker");
	
	        if (generationTracker) {
	            var upgradeTestSuitesGr = new GlideRecord('sn_um_upgrade_test_suites');
	            upgradeTestSuitesGr.addQuery("atf_generation_tracking_id", generationTracker);
	            upgradeTestSuitesGr.query();
	
	            while (upgradeTestSuitesGr.next()) {
	                var testSuiteRecord = upgradeTestSuitesGr.getValue("atf_test_suite_id");
	                if (testSuiteRecord) {
	                    var atfTestSuiteGr = new GlideRecord('sys_atf_test_suite');
	                    if (atfTestSuiteGr.get(testSuiteRecord)) {
	                        atfTestSuiteGr.setValue('active', false);
	                        atfTestSuiteGr.update();
	                    }
	                }
	            }
	
	            gr.setValue("atf_test_suite_generation_tracker", "");
	            result = gr.update();
	        }
	
	    } else {
	        gs.info('Record not found in sn_um_upgrade_sessions for ' + sessionId);
	    }
	
	    return result;
	},

    getCICDProgress: function(progressId) {
        var gr = GlideRecord("sys_execution_tracker");
        gr.get(progressId);
        var result = gr.getValue("result");
        return result;
    },

    truncateStoreTable: function(tableName) {
	    var allowedTables = [
	        "sn_um_incoming_app_version",
	        "sn_um_incoming_app",
	    	"sn_um_app_state_preview"
	    ];
	    if (allowedTables.indexOf(tableName) !== -1) {
	        gs.truncateTable(tableName);
	    }
	},

    activeUpgradeSession: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.get("status", "in_progress");
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.query();
            upgradeSessionGR.next();
            return upgradeSessionGR;
        } catch (e) {
            gs.info(e);
        }

    },
    createUpdateSet: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.get("status", "in_progress");
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.query();
            upgradeSessionGR.next();

            var updateSetGR = new GlideRecord("sys_update_set");

            updateSetGR.initialize();

            updateSetGR.application = 'global';
            updateSetGR.name = upgradeSessionGR.getValue("target_patch_label") + " upgrade plan";
            updateSetGR.description = upgradeSessionGR.getValue("target_patch_label") + ' upgrade plan';
            var updatesetsysid = updateSetGR.insert();

            upgradeSessionGR.setValue("sys_update_set", updatesetsysid);
            upgradeSessionGR.update();

            return updatesetsysid;
        } catch (e) {
            gs.info(e);
        }
    },
    updateActiveUpdateSet: function(id) {
        new GlideUpdateSet().set(id);
    },
    getActiveUpdateSet: function() {
        return new GlideUpdateSet().get();
    },
    getSessionUpdateSet: function() {
        var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
        upgradeSessionGR.get("status", "in_progress");
        upgradeSessionGR.orderByDesc('sys_updated_on');
        upgradeSessionGR.query();
        upgradeSessionGR.next();
        return upgradeSessionGR.getValue("sys_update_set");
    },
    shouldRefresh: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.get("status", "in_progress");
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.query();
            upgradeSessionGR.next();

            var sessionUpdateSet = upgradeSessionGR.getValue("sys_update_set");

            var activeUpdateSet = new GlideUpdateSet().get();

            if (sessionUpdateSet && activeUpdateSet) {
                if (sessionUpdateSet == activeUpdateSet) return {
                    shouldRefresh: false,
                }
                var updatesetGR = new GlideRecord("sys_update_set");
                updatesetGR.get(sessionUpdateSet);
                updatesetGR.query();
                updatesetGR.next();
                return {
                    shouldRefresh: true,
                    sys_id: sessionUpdateSet,
                    label: updatesetGR.getValue("name")
                };
            }
            return {
                shouldRefresh: false,
            };
        } catch (e) {
            gs.info(e);
        }
    },
    completeUpdateSet: function(shouldDelete) {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.get("status", "in_progress");
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.query();
            upgradeSessionGR.next();
            var updateSetGR = new GlideRecord("sys_update_set");
            updateSetGR.get(upgradeSessionGR.getValue("sys_update_set"));
	    if(shouldDelete) {
		var sysUpdateXmlGR = new GlideRecord('sys_update_xml');

		sysUpdateXmlGR.addQuery('update_set', upgradeSessionGR.getValue("sys_update_set"));
		sysUpdateXmlGR.addQuery('action', "DELETE");
		sysUpdateXmlGR.query();
	
		while (sysUpdateXmlGR.next()) {
		    sysUpdateXmlGR.deleteRecord();
		}
	    }

            if (updateSetGR.getValue("state") !== "complete") {
                updateSetGR.setValue("state", "complete");
                updateSetGR.update();
            }
        } catch (e) {
            gs.info(e);
        }
    },
    getLastCloneSummary: function() {
        try {
            var instanceNames = gs.getProperty("instance_name");

            var tableName = 'sn_um_lastclone_summary';
            var grInsert = new GlideRecord(tableName);
            grInsert.initialize();

            var SERVER_URL = gs.getProperty("sn_upgrade_mgmt.cloneinfoserver");
            INSTANCES = "/api/snc/cloneupgradeconsole/getCloneContextDetails";
            var json = global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(SERVER_URL);
            request.setPath(INSTANCES);
            request.setIdentityCertificateMutualAuth(true);
            request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode("ws.clone.kaa"));
            request.setHttpMethod('GET');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('instanceNames', instanceNames);
            var response = request.execute();

            var responseJson = JSON.parse(response.getBody());

            gs.info(response.getBody());

            if (responseJson && responseJson.result && responseJson.result.isError === true) {
                throw new Error("Unknown error occurred");
            }

            grInsert.start_time = responseJson.result.clnContext[0].startTime;
            grInsert.end_time = responseJson.result.clnContext[0].endTime;
            grInsert.source_instance = responseJson.result.clnContext[0].sourceInstance;
            grInsert.target_instance = responseJson.result.clnContext[0].targetInstance;
            grInsert.state = responseJson.result.clnContext[0].state;
            grInsert.is_fetch_error = false;

            return grInsert.insert();
        } catch (err) {
            gs.error(err);
            grInsert.is_fetch_error = true;

            return grInsert.insert();
        }
    },
    _isValidTable: function(tableName) {
        var allowedTables = [
            "sys_upgrade_plan",
            "sys_upgrade_plan_item",
            "sys_update_set",
            "sys_upgrade_plan",
            "upgrade_preview",
	          "sys_upgrade_skipped_record_rule",
	          "sys_execution_tracker"
        ];
        return allowedTables.indexOf(tableName) !== -1;
    },

    insertRecords: function(tableName, items) {
        if (!this._isValidTable(tableName)) return [];
    
        var gr = new GlideRecord(tableName);
        var insertedIds = [];
    
        for (var i = 0; i < items.length; i++) {
            gr.initialize();
            var item = items[i];
            for (var key in item) {
                if (item.hasOwnProperty(key)) {
                    gr.setValue(key, item[key]);
                }
            }
            insertedIds.push(gr.insert());
        }
    
        return insertedIds;
    },

    updateRecords: function(tableName, items) {
        if (!this._isValidTable(tableName)) return;

        var gr = new GlideRecord(tableName); // Created once

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.sys_id) continue;

            if (gr.get(item.sys_id)) {
                for (var key in item) {
                    if (item.hasOwnProperty(key) && key !== "sys_id") {
                        gr.setValue(key, item[key]);
                    }
                }
                gr.update();
            }
        }
    },

    deleteRecords: function(tableName, items) {
        if (!this._isValidTable(tableName)) return;

        var gr = new GlideRecord(tableName); // Created once

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.sys_id) continue;

            if (gr.get(item.sys_id)) {
                gr.deleteRecord();
            }
        }
    },

    getUpgradableVersions: function(appScope, currentVersion, allAvailableVersions) {
        var upgradableVersions = [];
        var availableVersions = allAvailableVersions[appScope] || [];

        for (var i = 0; i < availableVersions.length; i++) {
            var availableVersion = availableVersions[i];

            // Using your existing isUpgrade function
            if (this.versionComparator.isUpgrade(currentVersion, availableVersion)) {
                upgradableVersions.push(availableVersion);
            }
        }
        return upgradableVersions;
    },

    getInprocessInstallationAndScheduledApps: function(input) {
        try {
            var appIds = input;
            var updateInProgressApps = {};
            var updateItemGr = new GlideRecord("sys_batch_install_item");

            updateItemGr.addQuery("state", "ready");
            updateItemGr.addQuery("id", "IN", appIds.join(","));
            updateItemGr.orderByDesc("created"); // Sort by latest created date
            updateItemGr.query();

            var processedApps = {}; // Track processed appIds to store only the latest record

            while (updateItemGr.next()) {
                var appId = updateItemGr.getValue("id");
                // Store only the first (latest) record per appId
                if (!processedApps[appId]) {
                    updateInProgressApps[appId] = updateItemGr.getValue("id"); // Store the latest record
                    processedApps[appId] = true; // Mark this appId as processed
                }
            }

            var scheduledApps = {};
            var scheduleItemGr = new GlideRecord("sys_installation_schedule_item");
            scheduleItemGr.addQuery("state", "ready");
            scheduleItemGr.addQuery("source_app_id", "IN", appIds.join(","));
            scheduleItemGr.orderByDesc("created"); // Sort by latest created date
            scheduleItemGr.query();

            var _processedApps = {}; // Track processed source_app_ids to ensure only the latest record is stored

            while (scheduleItemGr.next()) {
                var _appId = scheduleItemGr.getValue("source_app_id");

                // Store only the first (latest) record per source_app_id
                if (!_processedApps[_appId]) {
                    scheduledApps[_appId] = _appId; // Store the latest scheduled app
                    _processedApps[_appId] = true; // Mark this source_app_id as processed
                }
            }
            return {
                updateInProgressApps: updateInProgressApps,
                scheduledApps: scheduledApps
            };
        } catch (e) {
            gs.error(e);
        }
    },
    isJSON: function(str) {
        if (typeof str !== 'string') return false;
        try {
            var parsed = JSON.parse(str);
            return parsed !== null && typeof parsed === 'object';
        } catch (e) {
            return false;
        }
    },
    isObject: function(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    installOrUpdateApp: function(requestBody, appDetails) {
		try{
            var requestBodyObj = JSON.parse(requestBody);
            if(!requestBodyObj || !requestBodyObj.packages || requestBodyObj.packages.length == 0){
                return;
            }

            // Delete previous schedule if existing before running
            if(appDetails.schedule && appDetails.schedule.schedule_id){
                this.deleteScheduleUpdateForTheApp(appDetails.schedule.schedule_id);
            }

            if(appDetails.installed_version == appDetails.requested_version){
                return true;
            }

            var strScript = "";
            if(!appDetails.installed_version || appDetails.installed_version==''){
                var singleAppRequestParams = {"queryParams":{"app_id":appDetails.id, "appId":appDetails.id, "name":appDetails.name, "scope":appDetails.scope, "load_demo_data":false, "version":appDetails.requested_version, "mode":"install"}}
                strScript = 'var singleAppRequestParams = ' + JSON.stringify(singleAppRequestParams) + '; var handler = new sn_appclient.AppManagerHandler(); var result = handler.installApp(singleAppRequestParams);';
			}else{
                var singleAppRequestParams = {"queryParams":{"app_id":appDetails.id, "appId":appDetails.id, "name":appDetails.name, "scope":appDetails.scope, "load_demo_data":false, "version":appDetails.requested_version, "mode":"update"}}
                strScript = 'var singleAppRequestParams = ' + JSON.stringify(singleAppRequestParams) + '; var handler = new sn_appclient.AppManagerHandler(); var result = handler.updateApp(singleAppRequestParams);';
            }

            var grSI = new GlideRecord('sys_script_include');
			grSI.get("9cd5d0f077902110c918256a5b5a99d0"); // Script id of AppManagerHandler script
			grSI.script = strScript;
			grSI.sys_scope = "781f36a96fef21005be8883e6b3ee43d"; // sn_appclient Scope sys_id
			var evaluator = new GlideScopedEvaluator();
			evaluator.putVariable('result', null);
			evaluator.evaluateScript(grSI, 'script');
			var result = evaluator.getVariable('result');

			var parsedResponse;
			if (result && result.statusCode == '200') {
				parsedResponse = JSON.stringify(result.responseData);
			}
            return parsedResponse?parsedResponse:result ;
		}catch(error){
			gs.error("Error while calling installApp on AppManagerHandler" + error.message);
			throw error;
		}
    },
    updateApps: function(requestBody) {
		try{
            var requestBodyObj = JSON.parse(requestBody);
            if(!requestBodyObj || !requestBodyObj.packages || requestBodyObj.packages.length == 0){
                return;
            }


            requestBodyObj.packages.forEach(nextApp => {
                this.installOrUpdateApp(requestBody,nextApp);
            });


//          var currentGdt = new GlideDateTime();
//          var currentDateTimeStr = currentGdt.getValue().replaceAll(":","-").replaceAll(" ","-");
            
//          var batchInstallPlanName = 'UpgradeManagementConsoleBatchUpdate-'+currentDateTimeStr;
//          requestBodyObj.name=batchInstallPlanName;
//          requestBodyObj.product_id=batchInstallPlanName;
//			var strScript = 'var batchInstallPlan = ' + JSON.stringify(requestBodyObj) + ';  var handler = new sn_appclient.AppManagerHandler(); var result = handler.installProduct(batchInstallPlan);';
//			var grSI = new GlideRecord('sys_script_include');
//			grSI.get("9cd5d0f077902110c918256a5b5a99d0"); // Script id of AppManagerHandler script
//			grSI.script = strScript;
//			grSI.sys_scope = "781f36a96fef21005be8883e6b3ee43d"; // sn_appclient Scope sys_id
//			var evaluator = new GlideScopedEvaluator();
//			evaluator.putVariable('result', null);
//			evaluator.evaluateScript(grSI, 'script');
//			var result = evaluator.getVariable('result');

//			var parsedResponse;
//			if (result && result.statusCode == '200') {
//				parsedResponse = JSON.stringify(result.responseData);
//			}
//            return parsedResponse?parsedResponse:result ;
        return {status:200, message:"Success"};
		}catch(error){
			gs.error("Error while calling batch Install" + error.message);
			return error;
		}
    },
    scheduleUpdateForTheApp: function(requestBody) {
        try{

            //Delete previous schedule, if exists
            if(requestBody.schedule && requestBody.schedule.schedule_id){
                this.deleteScheduleUpdateForTheApp(requestBody.schedule.schedule_id);
            }

            requestBody = JSON.stringify(requestBody);
            var strScript = 'var requestParams = {};requestParams.action = "create_schedule";requestParams.schedule = ' + JSON.stringify(requestBody) + ';var handler = new sn_appclient.ScheduledInstallService();var result = handler.processRequest(requestParams);';
            
            var grSI = new GlideRecord('sys_script_include');
            grSI.get("000b82eb93312010ebd4f157b67ffb86"); // Any script include in sn_appclient scope
            grSI.script = strScript;
            grSI.sys_scope = "781f36a96fef21005be8883e6b3ee43d"; // sn_appclient Scope sys_id
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('result', null);
            evaluator.evaluateScript(grSI, 'script');
            var result = evaluator.getVariable('result');

            var parsedResponse;
            if (result && result.statusCode == '200') {
                parsedResponse = JSON.stringify(result.responseData);
            }
            return parsedResponse?parsedResponse:result ;
		}catch(error){
			gs.error("Error while calling schedule api for app" + error.message);
			return error;
		}
    },
    scheduleUpdateForApps: function(requestBody) {
        try{

            var requestBodyObj = JSON.parse(requestBody);
            
            if(!requestBodyObj || !requestBodyObj.list_of_apps || requestBodyObj.list_of_apps.length == 0){
                return false;
            }

            var list_of_apps = requestBodyObj.list_of_apps;
            list_of_apps.forEach(nextApp => {
                 var scheduleAppPayload = {};
                 scheduleAppPayload.name = nextApp.name;
                 scheduleAppPayload.start_time = requestBodyObj.start_time;
                 scheduleAppPayload.list_of_apps = [nextApp];
                 scheduleAppPayload.schedule = nextApp.schedule;
                 this.scheduleUpdateForTheApp(scheduleAppPayload);
            });
		}catch(error){
			gs.error("Error while calling schedule api for the app " + error.message);
			return error;
		}
    },
    deleteScheduleUpdateForApps: function(requestBody) {
        try{
            var requestBodyObj = JSON.parse(requestBody);
            if(!requestBodyObj || !requestBodyObj.list_of_apps || requestBodyObj.list_of_apps.length == 0){
                return false;
            }
            var list_of_apps = requestBodyObj.list_of_apps;
            list_of_apps.forEach(nextApp => {
                 if(nextApp.schedule && nextApp.schedule.schedule_id){
                    this.deleteScheduleUpdateForTheApp(nextApp.schedule.schedule_id);
                 }
            });
		}catch(error){
			gs.error("Error while calling schedule api for the app " + error.message);
			return error;
		}
    },
    deleteScheduleUpdateForTheApp: function(currentScheduleId) {
        try{

            if(!currentScheduleId || currentScheduleId === ''){
                return true;
            }

            var strScript = 'var requestParams = {};requestParams.action = "delete_schedule"; requestParams.schedule_id = \"'+currentScheduleId+'\"; var handler = new sn_appclient.ScheduledInstallService();var result = handler.processRequest(requestParams);';
            
            var grSI = new GlideRecord('sys_script_include');
            grSI.get("000b82eb93312010ebd4f157b67ffb86"); // Any script include in sn_appclient scope
            grSI.script = strScript;
            grSI.sys_scope = "781f36a96fef21005be8883e6b3ee43d"; // sn_appclient Scope sys_id
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('result', null);
            evaluator.evaluateScript(grSI, 'script');
            var result = evaluator.getVariable('result');

            var parsedResponse;
            if (result && result.statusCode == '200') {
                parsedResponse = JSON.stringify(result.responseData);
            }
            return parsedResponse?parsedResponse:result ;
		}catch(error){
			gs.error("Error while calling schedule api for app" + error.message);
			return error;
		}
    },
    fetchAllAvailableVersions: function() {
        var versions = {};
        var versionGR = new GlideRecord('sys_app_version');
        versionGR.query();
        while (versionGR.next()) {
            var scope = versionGR.getValue('scope');
            var version = versionGR.getValue('version');
            if (!versions[scope]) {
                versions[scope] = [];
            }
            // Avoid duplicates
            if (versions[scope].indexOf(version) === -1) {
                versions[scope].push(version);
            }
        }
        return versions;
    },

    getUpgradeAppList: function(upgradePlanSysId) {
		var scheduledApps = {};
        var scheduleItemGr = new GlideRecord("sys_installation_schedule_item");
        scheduleItemGr.addQuery("state", "ready");
        // scheduleItemGr.addQuery("source_app_id", "IN", appIds.join(","));
        scheduleItemGr.orderByDesc("created"); // Sort by latest created date
        scheduleItemGr.query();

        var _processedApps = {}; // Track processed source_app_ids to ensure only the latest record is stored

        while (scheduleItemGr.next()) {
            var _appId = scheduleItemGr.getValue("source_app_id");

            // Store only the first (latest) record per source_app_id
            if (!_processedApps[_appId]) {
                scheduledApps[_appId] = {
					start_time: scheduleItemGr.getValue("start_time")
				}; // Store the latest scheduled app
                _processedApps[_appId] = true; // Mark this source_app_id as processed
            }
        }

	var appclientProgressTrackerGR = new GlideRecord('sn_appclient_progress_tracker');
	var progressTrackerStatus = {};
	appclientProgressTrackerGR.orderBy("sys_updated_on");
	
	appclientProgressTrackerGR.query();
	while(appclientProgressTrackerGR.next()) {
		if(appclientProgressTrackerGR.getValue('state') != 2) {
			var sysExecutionTrackerGR = new GlideRecord("sys_execution_tracker");
			sysExecutionTrackerGR.get(appclientProgressTrackerGR.getValue('tracker_id'));
			progressTrackerStatus[appclientProgressTrackerGR.getValue("app_id")] = 	sysExecutionTrackerGR.getDisplayValue("state");

		} else {
			
			progressTrackerStatus[appclientProgressTrackerGR.getValue("app_id")] = 	appclientProgressTrackerGR.getDisplayValue("state");
		}
	}


        var apps = {};
        // Take all available versions instead of looking for versions for each app inside query(Fastest approach).
        var allAvailableVersions = this.fetchAllAvailableVersions(); // Fetch all versions once
        //Failed Apps with Higher versions avaialble.
        var grFailedView = new GlideRecord('sn_upgrade_mgmt_um_upgrade_app_store_page_view_failed');
        grFailedView.addQuery("planitem_upgrade_plan", upgradePlanSysId);
        // grFailedView.addQuery('history_status_message', 'failed'); // Only fetch records with "failed" status - need to check exact value
        grFailedView.orderBy("history_status_message"); // Sorting by history_status_message
        grFailedView.query();
        while (grFailedView.next()) {
            var _currentVersion = grFailedView.getValue('currentstore_version');
            var _appScope = grFailedView.getValue('currentstore_scope');
            var _appName = grFailedView.getValue('currentstore_name');
            var _appSysId = grFailedView.getValue('currentstore_sys_id');
            var _isStoreApp = grFailedView.getValue('currentstore_is_store_app');
            var _statusMessage = grFailedView.getValue('history_status_message');
            var _disposition = grFailedView.getValue('history_disposition');
            // Get upgradable versions
            var _upgradableVersions = this.getUpgradableVersions(_appScope, "0.0.0", allAvailableVersions); // failed new installations will not have a current version


            if (_upgradableVersions.length > 0) {
                apps[_appScope] = {
                    app_name: _appName,
                    app_sys_id: _appSysId,
                    is_store_app: _isStoreApp,
                    scope: _appScope,
                    installed_version: "", // as this is a new installation that failed
                    upgradable_versions: _upgradableVersions,
                    status_message: _statusMessage,
                    disposition: _disposition,
	            isScheduled: scheduledApps[_appSysId] ? scheduledApps[_appSysId].start_time : null,
		    state: progressTrackerStatus[_appSysId]
                };
            }
        }

        //Installed Apps with Higher versions avaialble.
        var grView = new GlideRecord('sn_upgrade_mgmt_um_upgrade_app_store_page_view_installed');
        grView.addQuery("planitem_upgrade_plan", upgradePlanSysId);
        grView.orderBy("history_status_message"); // Sorting by history_status_message
        grView.query();
        while (grView.next()) {
            var currentVersion = grView.getValue('currentstore_version');
            var appScope = grView.getValue('currentstore_scope');
            var appName = grView.getValue('currentstore_name');
            var appSysId = grView.getValue('currentstore_sys_id');
            var isStoreApp = grView.getValue('currentstore_is_store_app');
            var statusMessage = grView.getValue('history_status_message');
            var disposition = grView.getValue('history_disposition');
            // Get upgradable versions
            var upgradableVersions = this.getUpgradableVersions(appScope, currentVersion, allAvailableVersions);
            if (upgradableVersions.length === 0) // If app was upgraded to latest, we still need to show the status of it
                upgradableVersions.push(currentVersion);
            if (upgradableVersions.length > 0) {
                apps[appScope] = {
                    app_name: appName,
                    app_sys_id: appSysId,
                    is_store_app: isStoreApp,
                    scope: appScope,
                    installed_version: currentVersion,
                    upgradable_versions: upgradableVersions,
                    status_message: statusMessage,
                    disposition: disposition,
		    isScheduled: scheduledApps[appSysId] ? scheduledApps[appSysId].start_time : null,
		    state: progressTrackerStatus[appSysId]
                };
            }
        }

        // Apps not selected as part of upgrade plan but still have available updates.
        var gr = new GlideRecord('sys_store_app');
        gr.query();

        while (gr.next()) {
            var __appScope = gr.getValue('scope');
            if (apps.hasOwnProperty(__appScope))
                continue;

            var __currentVersion = gr.getValue('version');
            var __appName = gr.getValue('name');
            var __appSysId = gr.getValue('sys_id');
            var __isStoreApp = gr.getValue('is_store_app');
            var __statusMessage = "Not selected during preview stage"; // No status as it was not selected
            // Get upgradable versions
            var __upgradableVersions = this.getUpgradableVersions(__appScope, __currentVersion, allAvailableVersions);
            if (__upgradableVersions.length > 0) {
                apps[__appScope] = {
                    app_name: __appName,
                    app_sys_id: __appSysId,
                    is_store_app: __isStoreApp,
                    scope: __appScope,
                    installed_version: __currentVersion,
                    upgradable_versions: __upgradableVersions,
                    status_message: __statusMessage,
                    disposition: "",
		    isScheduled: scheduledApps[__appSysId] ? scheduledApps[__appSysId].start_time : null,
		    state: progressTrackerStatus[__appSysId]
                };
            }
        }
        


        return apps;
    },

    batchUpdateUpgradeSessionConfigValues: function(sysIds) {
        try {
            var sessionGR = new GlideRecord("sn_um_upgrade_session_config");

            for (var i = 0; i < sysIds.length; i++) {
                if (sessionGR.get(sysIds[i].sysId)) {
                    sessionGR.setValue("setting_value", sysIds[i].value);
                    sessionGR.update();
                }
            }
        } catch (error) {
            gs.info("Error: " + error);
        }
    },

    triggerUpgradePreview: function(currentPatchId, targetPatchId) {
        var executionTrackerId = sn_uc.UpgradePreviewUtil.generateChangelist(currentPatchId, targetPatchId);
        return executionTrackerId;
    },

    triggerBulkAppUpgradePreview: function(upgradePlan, currentPatchId, targetPatchId){
        var executionTrackerId = sn_uc.UpgradePreviewUtil.generateBulkAppPreview(upgradePlan, currentPatchId, targetPatchId);
        return executionTrackerId;
    },

    /**
     * Updates comments and resolution_status fields in sys_upgrade_history_log table based on filename filters
     *
     * @param {Object} records - Object containing file name, comments
     * @param {String} upgradeHistorySysId
     * @returns {Object} Summary of updates performed
     */
    updateUpgradeHistoryLogByFileName: function(records, upgradeHistorySysId) {
        var fileNames = Object.keys(records);
        // Validate inputs
        if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
            gs.error('UM: No filenames provided for filtering');
            return {
                success: false,
                message: 'No filenames provided',
                updated: 0,
                processed: 0
            };
        }
        if (!upgradeHistorySysId) {
            gs.error('UM: upgradeHistorySysId not provided');
            return {
                success: false,
                message: 'upgradeHistorySysId not provided',
                updated: 0,
                processed: 0
            };
        }

        // Initialize counters
        var processed = 0;
        var updated = 0;
        var errors = 0;

        // Create GlideRecord
        var gr = new GlideRecordSecure('sys_upgrade_history_log');

        var baseQuery = 'upgrade_history.sys_id=' + upgradeHistorySysId + '^resolution_status=not_reviewed^ORresolution_status=';

        // Build query condition for filename and plugin using exact matching
        // First filename without OR
        gr.addEncodedQuery(baseQuery + '^file_name=' + fileNames[0] + '^plugin=' + records[fileNames[0]].plugin, true);

        // Additional filenames and plugins with OR
        for (var i = 1; i < fileNames.length; i++) {
            gr.addEncodedQuery('^NQ' + baseQuery + '^file_name=' + fileNames[i] + '^plugin=' + records[fileNames[i]].plugin, true);
        }

        // Execute query
        gr.query();

        // Process results
        while (gr.next()) {
            processed++;

            try {
                var recordInternal = {
                    sysId: gr.getValue('sys_id'),
                    fileName: gr.getValue('file_name'),
                    comments: gr.getValue('comments')
                };

                // Update resolution_status
                gr.setValue('resolution_status', 'reviewed_retained');

                // Update comments if provided
                if (records[gr.file_name].comments) {
                    gr.setValue('comments', records[gr.file_name].comments);
                }

                // Save changes
                var updateSuccess = gr.update();

                if (updateSuccess) {
                    updated++;
                    // gs.info('Successfully updated record: ' + gr.sys_id);
                } else {
                    errors++;
                    gs.error('UM: Failed to update retained record: ' + gr.sys_id);
                }
            } catch (e) {
                errors++;
                gs.error('UM: Error updating retained record ' + gr.sys_id + ': ' + e);
            }
        }

        // Generate summary
        var summary = {
            success: (updated > 0),
            message: updated + ' of ' + processed + ' records updated successfully',
            processed: processed,
            updated: updated,
            errors: errors,
            fileNames: fileNames
        };

        gs.info('UM: Retained update summary: ' + JSON.stringify(summary));
        return summary;
    },
    installAppsForProduct: function(payload) {
		try {
			var payloadStr = JSON.stringify(payload);
			var strScript = 'var installationPlan = ' + payloadStr + ';' +
				'var handler = new AppManagerHandler();' +
				'var result = handler.installProduct(installationPlan, "product");';

			var grSI = new GlideRecord("sys_script_include");
			grSI.get("000b82eb93312010ebd4f157b67ffb86"); // Script include in sn_appclient scope
			grSI.script = strScript;
			grSI.sys_scope = "781f36a96fef21005be8883e6b3ee43d"; // sn_appclient scope sys_id

			var evaluator = new GlideScopedEvaluator();
			evaluator.putVariable("result", null);
			evaluator.evaluateScript(grSI, "script");
			var result = evaluator.getVariable("result");

			var parsedResponse;
			if (result && result.statusCode == "200") {
				parsedResponse = JSON.stringify(result.responseData);
			}

			gs.info("UpgradeConsoleGlobalUtils.installAppsForProduct: Completed");
			return parsedResponse ? parsedResponse : JSON.stringify(result);
		} catch (error) {
			gs.error("UpgradeConsoleGlobalUtils.installAppsForProduct: Error - " + error.message);
			throw error;
		}
	},

    // Canonical skipped filter (mirrors broker 'Get skipped records count' and
    // system-upgrade overview macroponent 216aa0857f2312100c3ed6065c8665c0):
    //   dispositionIN 4,5,9,10,104,105  AND  changed=true
    //   OR disposition=9
    //   OR (disposition=2 AND resolution_status=reviewed_reverted AND changed=true)
    // disposition=2 (Updated) only counts when resolution_status=reviewed_reverted.
    // ---------------------------------------------------------------------------

    countBulkSkippedRecords: function(historySysId) {
        var result = { total: 0, notReviewed: 0, reviewed: 0, resolved: 0 };
        if (!historySysId) return result;
        try {
            var versionCond = 'upgrade_history.sys_id=' + historySysId;
            var skippedTotalQ =
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^NQ' + versionCond +
                '^disposition=2^resolution_status=reviewed_reverted^changed=true';

            var grTotal = new GlideRecord('sys_upgrade_history_log');
            grTotal.addEncodedQuery(skippedTotalQ);
            grTotal.query();
            result.total = grTotal.getRowCount();

            var grNotR = new GlideRecord('sys_upgrade_history_log');
            grNotR.addEncodedQuery(
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^resolution_status=not_reviewed^ORresolution_status=');
            grNotR.query();
            result.notReviewed = grNotR.getRowCount();

            var grR = new GlideRecord('sys_upgrade_history_log');
            grR.addEncodedQuery(
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^resolution_status!=not_reviewed^resolution_status!=');
            grR.query();
            result.reviewed = grR.getRowCount();

            var grAuto = new GlideRecord('sys_upgrade_history_log');
            grAuto.addEncodedQuery(
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^resolution_status=auto_resolved');
            grAuto.query();
            result.resolved = grAuto.getRowCount();
        } catch (e) {
            gs.error('UpgradeManagementApiUtil.countBulkSkippedRecords error: ' + e);
        }
        return result;
    },

    countSkippedWithoutTests: function(historySysId) {
        var n = 0;
        if (!historySysId) return n;
        try {
            var versionCond = 'upgrade_history.sys_id=' + historySysId;
            var skippedQ =
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^NQ' + versionCond +
                '^disposition=2^resolution_status=reviewed_reverted^changed=true';

            var gr = new GlideRecord('sys_upgrade_history_log');
            gr.addEncodedQuery(skippedQ);
            gr.query();
            while (gr.next()) {
                try {
                    var meta = sn_atf.AutomatedTestingFramework.tracedMetadataForMetadata(gr.getUniqueValue());
                    if (!meta || !meta.hasNext()) n++;
                } catch (innerE) {
                    n++;
                }
            }
        } catch (e) {
            gs.error('UpgradeManagementApiUtil.countSkippedWithoutTests error: ' + e);
        }
        return n;
    },

    getBulkSkippedRecordsList: function(historySysId, offset, limit) {
        var rows = [];
        if (!historySysId) return rows;
        var off = parseInt(offset || 0, 10);
        var lim = parseInt(limit || 10, 10);
        try {
            var versionCond = 'upgrade_history.sys_id=' + historySysId;
            var skippedQ =
                versionCond +
                '^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9' +
                '^NQ' + versionCond +
                '^disposition=2^resolution_status=reviewed_reverted^changed=true';

            var gr = new GlideRecord('sys_upgrade_history_log');
            gr.addEncodedQuery(skippedQ);
            gr.orderBy('resolution_status');
            gr.orderBy('target_name');
            gr.chooseWindow(off, off + lim);
            gr.query();
            while (gr.next()) {
                var fileName = gr.getDisplayValue('target_name');
                var testCount = 0;
                try {
                    var ca = new GlideAggregate('sys_traced_metadata');
                    ca.addAggregate('COUNT');
                    ca.addQuery('sys_update_name', fileName);
                    ca.query();
                    if (ca.next()) testCount = parseInt(ca.getAggregate('COUNT'), 10) || 0;
                } catch (te) {
                    // test_count stays 0
                }
                rows.push({
                    a_sys_id:               { displayValue: gr.getDisplayValue('sys_id'),            value: gr.getValue('sys_id') },
                    b_sys_id:               { displayValue: '',                                       value: '' },
                    a_file_name:            { displayValue: fileName,                                 value: gr.getValue('target_name') },
                    a_application_category: { displayValue: gr.getDisplayValue('type'),              value: gr.getValue('type') },
                    a_resolution_status:    { displayValue: gr.getDisplayValue('resolution_status'), value: gr.getValue('resolution_status') },
                    b_assigned_to:          { displayValue: '',                                       value: '' },
                    a_disposition:          { displayValue: gr.getDisplayValue('disposition'),       value: gr.getValue('disposition') },
                    a_type_priority:        { displayValue: '',                                       value: '' },
                    a_plugin:               { displayValue: gr.getDisplayValue('plugin'),            value: gr.getValue('plugin') },
                    test_count: testCount
                });
            }
        } catch (e) {
            gs.error('UpgradeManagementApiUtil.getBulkSkippedRecordsList error: ' + e);
        }
        return rows;
    },

    type: 'UpgradeManagementApiUtil'
};
