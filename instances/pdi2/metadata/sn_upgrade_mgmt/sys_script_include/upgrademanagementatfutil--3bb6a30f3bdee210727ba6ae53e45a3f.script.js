var UpgradeManagementATFUtil = Class.create();
	UpgradeManagementATFUtil.prototype = {
    initialize: function() {
    },

	checkIfTroubleshootingSkillEnabled: function() {
		// Removed the logic for troubleshooting agent feature removal
        return false;
	},

	getTroubleshootingTracker: function(sessionId) {
		// Removed the logic for troubleshooting agent feature removal
		return {
			id: "",
			state: "",
			percentComplete: "",
        };
	},

	checkIfTroubleshootingResultsExists: function(sessionId) {
		// Removed the logic for troubleshooting agent feature removal
        return false;
    },

	checkIfATFInstalled: function() {
        try {
            var atfGR = new GlideRecord('sys_store_app');
            atfGR.addQuery('scope', 'sn_atf_tg');
            atfGR.query();
            return atfGR.hasNext();
        } catch (error) {
            gs.error("Error" + error);
        }
    },

	checkIfATFAssistInstalled: function() {
		// Removed the logic for troubleshooting agent feature removal
        return false;
    },
	checkIfATFAppAvailable: function() {
        try {
            var atfAppGR = new GlideRecord('sys_remote_app');
            atfAppGR.addQuery('scope', 'sn_atf_tg');
            atfAppGR.query();
            return atfAppGR.hasNext();
        } catch (error) {
            gs.error("Error" + error);
        }
    },

	// Pre Testing Functions
    moveRecordsToUpgradeTable: function(session_id, selectedRecords, exceptedRecords) {
        try {
            var sys_id_array = [];

            if (selectedRecords && selectedRecords.length > 0) {
                // Use selectedRecords directly
                sys_id_array = selectedRecords;
            } else {
                // Fetch all active test suites, possibly excluding exceptedRecords
                var gr = new GlideRecord('sys_atf_test_suite');
                gr.addActiveQuery();
                if (exceptedRecords && exceptedRecords.length > 0) {
                    gr.addQuery('sys_id', 'NOT IN', exceptedRecords.join(','));
                }
                gr.query();
                while (gr.next()) {
                    sys_id_array.push(gr.getValue('sys_id'));
                }
            }

            // Process all collected test suite sys_ids
            for (var j = 0; j < sys_id_array.length; j++) {
                this.moveRecordToUpgradeTable(sys_id_array[j], session_id);
            }
        } catch (error) {
            gs.error("Error in moveRecordsToUpgradeTable: " + error);
        }
    },

    moveRecordToUpgradeTable: function(sys_id, session_id) {
        try {
            var rec = new GlideRecord("sn_um_upgrade_test_suites");
            rec.addQuery('upgrade_session_id', session_id);
            rec.addQuery('atf_test_suite_id', sys_id);
            rec.query();
            if (rec.next()) {
                return rec.getUniqueValue();
            }
            rec.initialize();
            rec.atf_test_suite_id = sys_id;
            rec.upgrade_session_id = session_id;
            return rec.insert();
        } catch (error) {
            gs.error("Error" + error);
        }
    },

    deleteRecordFromUpgradeTable: function(session_id, selectedRecords, exceptedRecords) {
        try {
            var count = 0;
            var deleteGR = new GlideRecordSecure('sn_um_upgrade_test_suites');

            if (selectedRecords && selectedRecords.length > 0) {
                // Case 1: Delete specific selected records
                deleteGR.addQuery('sys_id', 'IN', selectedRecords.join(','));
            } else {
                // Case 2 & 3: Delete based on session_id (optionally excluding some records)
                deleteGR.addQuery('upgrade_session_id', session_id);
                if (exceptedRecords && exceptedRecords.length > 0) {
                    deleteGR.addQuery('sys_id', 'NOT IN', exceptedRecords.join(','));
                }
            }

            deleteGR.query();
            while (deleteGR.next()) {
                deleteGR.deleteRecord();
                count++;
            }

            return count;
        } catch (error) {
            gs.error("Error in deleteRecordFromUpgradeTable: " + error);
            return 0;
        }
    },

    startTestGenerator: function(session_id) {
		gs.info("ATF test generation started for : " + session_id);
		var userEmail = gs.getUser().getEmail();
        var boqId = sn_atf_tg.CloudRunnerAPI.TestGenerationAPI.startJob({
            "email": userEmail
        });

        var upgradeSession = new GlideRecord('sn_um_upgrade_sessions');
        if (upgradeSession.get(session_id)) {
            upgradeSession.atf_test_suite_generation_tracker = boqId;
            upgradeSession.update();
        } else {
            gs.info('Record not found');
        }

        var gp = new GlideRecord('sn_atf_tg_sn_boq');
        gp.get(boqId);
        var gdt = new GlideDateTime(gp.sys_created_on);
		var created = gdt.getDisplayValue();

        return {
            boqId: boqId,
            created: created
        };
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

    getAgenticState: function(sessionId) {
        var gr = new GlideRecord('sn_um_upgrade_sessions');
        gr.addQuery('sys_id', sessionId);
        var sessionSysId = null;
		var sessionType = null;
        gr.query();
        if (gr.next()) {
            sessionSysId = gr.getValue('sys_id');
			sessionType = gr.getValue('session_type');
        }

        var gp = new GlideRecord('sn_um_upgrade_session_config');
        var query = 'upgrade_session_id=' + sessionSysId + '^setting_key=generate_atf_tests';
        gp.addQuery(query);
        var isAutoGenerateActive = null;
        gp.query();
        if (gp.next()) {
            isAutoGenerateActive = gp.getValue('setting_value');
        }
		if(sessionType === 'bulk_app_update' && isAutoGenerateActive == 1){
			gp.setValue('setting_value', false);
			gp.update();
			isAutoGenerateActive = false;
		}
        return {
            'isAutoGenerateActive': isAutoGenerateActive == 1 ? true : false,
			'sessionType': sessionType
        };
    },

    getPreTestingStatus: function(sessionId) {
        gs.info("PreTest Status called for sessionId: " + sessionId);
        var stateObj = new global.UpgradeManagementApiUtil().getTestSuiteId(sessionId);
        var agenticState = this.getAgenticState(sessionId);
        var finalObj = {};

        // Copy properties from stateObj
        for (var key in stateObj) {
            if (stateObj.hasOwnProperty(key)) {
                finalObj[key] = stateObj[key];
            }
        }

        // Copy properties from agenticState
        for (var item in agenticState) {
            if (agenticState.hasOwnProperty(item)) {
                finalObj[item] = agenticState[item];
            }
        }
        var cloudUserSet = false;
        if (gs.getProperty('sn_atf_tg.username')) {
            cloudUserSet = true;
        }
		
		var setValue = gs.getProperty('sn_atf.runner.enabled');
	var atfEnabled = (setValue.toLowerCase() === "true");
		var atfInstalled = this.checkIfATFInstalled();

        // Auto enable ATF properties if atf app is installed but properties not enabled
        if(atfInstalled && !atfEnabled){
			atfEnabled = new global.UpgradeManagementApiUtil().enableATFProperties();
        }

        finalObj.cloudUserDefined = cloudUserSet;
        finalObj.atfEnabled = atfEnabled;
        finalObj.atfInstalled = atfInstalled;
        return finalObj;
    },

    cancelTestGenerator: function(sessionId) {
		gs.info("Cancel test generator for sessionID: " + sessionId);
        try {
            var gr = new GlideRecord('sn_um_upgrade_sessions');
            if (gr.get(sessionId)) {
                var boqId = gr.getValue("atf_test_suite_generation_tracker");
				var cancelStatus = sn_atf_tg.CloudRunnerAPI.TestGenerationAPI.cancelJob({
                    snboqId: boqId
                });
                return cancelStatus;
            }
        } catch (err) {
            gs.info("TG cancel: " + err);
        } finally {
            new global.UpgradeManagementApiUtil().freeBoqFromSession(sessionId);
        }
    },

    statusTestGenerator: function(boqId) {
		gs.info("Local status test generator called.");
        var status = {
            testsSucceeded: 0,
            testsFailed: 0,
            testsPending: 0,
            testsInProgress: 0,
            testsDequeued: 0,
            testsSkipped: 0
        };

        // if(!GlideTableDescriptor.isValid("sn_atf_tg_generated_test")){
        //     status.state = 'pending';
        //     status.progress = 0;
        //     return JSON.stringify(status);
        // }

        var ga = new GlideAggregate('sn_atf_tg_generated_test');
        ga.addQuery("snboq", boqId);
        ga.groupBy('state');
        ga.addAggregate('COUNT');
        ga.query();

        // Define state groupings
        var pendingStates = ['queued'];
        var inProgressStates = ['getting_form_data', 'running_test', 'creating_test'];

        while (ga.next()) {
            var state = ga.getValue('state');
            var count = parseInt(ga.getAggregate('COUNT'), 10) || 0;

            switch (state) {
                case 'succeeded':
                    status.testsSucceeded += count;
                    break;
                case 'failed':
                    status.testsFailed += count;
                    break;
                case 'skipped':
                    status.testsSkipped += count;
                    break;
                case 'dequeued':
                    status.testsDequeued += count;
                    break;
                default:
                    if (pendingStates.indexOf(state) !== -1) {
                        status.testsPending += count;
                    } else if (inProgressStates.indexOf(state) !== -1) {
                        status.testsInProgress += count;
                    } else {
                        // Unknown state fallback
                        status.testsInProgress += count;
                    }
            }
        }

        var boqStates = this.getBoqState(boqId);
        status.state = boqStates.state;
        status.progress = boqStates.progress;
	
        return JSON.stringify(status);
    },


	// Post Testing Funtions
    getPostTestingStatus: function(sessionId) {
        var result = {
            success_count: 0,
            failure_count: 0,
            skip_count: 0,
            error_count: 0,
            total_count: 0,
            is_complete: true,
            success_link: '',
            failure_link: '',
            skip_link: '',
            error_link: '',
            all_link: '',
            status: 'complete',
            cloudUserDefined: false,
            atfEnabled: false,
            atfInstalled: false,
        };

        if (!sessionId) {
            gs.info("getPostTestingStatus: Invalid session ID");
            result.status = "norecord";
            return result;
        }

        // Load ATF config
        var cloudUserSet = false;
        if (gs.getProperty('sn_atf_tg.username')) {
            cloudUserSet = true;
        }
		var setValue = gs.getProperty('sn_atf.runner.enabled');
        var atfEnabled = (setValue.toLowerCase() === "true");
        var atfInstalled = this.checkIfATFInstalled();

        // Auto enable ATF properties if atf app is installed but properties not enabled
        if(atfInstalled && !atfEnabled){
            atfEnabled = new global.UpgradeManagementApiUtil().enableATFProperties();
        }

        result.cloudUserDefined = cloudUserSet;
        result.atfEnabled = atfEnabled;
        result.atfInstalled = atfInstalled;

        // Step 1: Collect test suite and execution IDs
        var suiteExecutionIds = [];
        var upgradeTestSuites = [];
        var upgradeSuiteGr = new GlideRecord('sn_um_upgrade_test_suites');
        upgradeSuiteGr.addQuery('upgrade_session_id', sessionId);
        upgradeSuiteGr.query();

        var foundRecords = false;

        while (upgradeSuiteGr.next()) {
            foundRecords = true;
            upgradeTestSuites.push(upgradeSuiteGr.getValue('sys_id'));

            var execId = upgradeSuiteGr.getValue('suite_execution_id');
            if (execId) {
                suiteExecutionIds.push(execId);
            } else {
                // Suite has not been executed yet
                result.is_complete = false;
            }
        }

        // Always generate links (even if no suite executions yet)
        var encodedExecIds = suiteExecutionIds.map(encodeURIComponent).join(',');
        result.success_link = "/sys_atf_test_result_list.do?sysparm_query=parentIN" + encodedExecIds + "^statusINsuccess,success_with_warnings";
        result.failure_link = "/sys_atf_test_result_list.do?sysparm_query=parentIN" + encodedExecIds + "^statusINfailure,error";
        result.skip_link = "/sys_atf_test_result_list.do?sysparm_query=parentIN" + encodedExecIds + "^status=skipped";
        result.error_link = "/sys_atf_test_result_list.do?sysparm_query=parentIN" + encodedExecIds + "^status=error";
        result.all_link = "/sys_atf_test_result_list.do?sysparm_query=parentIN" + encodedExecIds;

        // If no test suite records were found
        if (!foundRecords || upgradeTestSuites.length === 0) {
            result.status = "norecord";
            return result;
        }

        // Step 2: Summarize test suite result rollups
        if (suiteExecutionIds.length > 0) {
            var testSuiteResultGr = new GlideRecord('sys_atf_test_suite_result');
            testSuiteResultGr.addQuery('sys_id', 'IN', suiteExecutionIds.join(','));
            testSuiteResultGr.query();

            while (testSuiteResultGr.next()) {
                if (!testSuiteResultGr.getValue('end_time')) {
                    result.is_complete = false;
                }
            }
            var statusCounts = {
				success: 0,
				success_with_warnings: 0,
				failure: 0,
				error: 0,
				skipped: 0,
				total: 0
			};

			// Use objects to track unique test IDs per status
			var uniqueTests = {
				success: {},
				success_with_warnings: {},
				failure: {},
				error: {},
				skipped: {}
			};

			var allUniqueTests = {}; // Track all unique tests for total count

			var testResultGR = new GlideRecord('sys_atf_test_result');
			testResultGR.addQuery('parent', 'IN', suiteExecutionIds.join(','));
			testResultGR.query();

			while (testResultGR.next()) {
				var status = testResultGR.getValue('status');
				var testId = testResultGR.getValue('test'); // The actual test definition, not the result
				
				// Track unique tests per status
				if (uniqueTests.hasOwnProperty(status) && testId) {
					uniqueTests[status][testId] = true;
				}
				
				// Track all unique tests for total
				if (testId) {
					allUniqueTests[testId] = true;
				}
			}

			// Count unique tests for each status
			for (var status in uniqueTests) {
				if (uniqueTests.hasOwnProperty(status)) {
					statusCounts[status] = Object.keys(uniqueTests[status]).length;
				}
			}

			// Total unique tests
			statusCounts.total = Object.keys(allUniqueTests).length;
            result.success_count = statusCounts.success + statusCounts.success_with_warnings;
            result.failure_count = statusCounts.failure + statusCounts.error;
            result.skip_count = statusCounts.skipped;
            result.error_count = statusCounts.error;
            result.total_count = statusCounts.total;

        }

        // Finalize
        // result.total_count = result.success_count + result.failure_count + result.skip_count + result.error_count;
        result.status = result.is_complete ? 'complete' : 'progress';
        gs.info("getPostTestingStatus: " + JSON.stringify(result));
        return result;
    },

    runTestSuites: function(session_id) {
        gs.info('Run post tests on page load');
        var result = {
            status: 'complete',
            testSuites: [],
            upgradeTestSuiteSysIds: []
        };

        var cloudUserSet = false;
        if (gs.getProperty('sn_atf_tg.username')) {
            cloudUserSet = true;
        }
        var setValue = gs.getProperty('sn_atf.runner.enabled');
        var atfEnabled = (setValue.toLowerCase() === "true");
        var atfInstalled = this.checkIfATFInstalled();


        result.cloudUserDefined = cloudUserSet;
        result.atfEnabled = atfEnabled;
        result.atfInstalled = atfInstalled;

        if (!(cloudUserSet && atfEnabled && atfInstalled)) {
            result.status = 'atf_not_configured';
            return result;
        }

        var upgradeSuiteGr = new GlideRecord('sn_um_upgrade_test_suites');
        upgradeSuiteGr.addQuery('upgrade_session_id', session_id);
        upgradeSuiteGr.addQuery('suite_execution_id', 'ISNULL');
        upgradeSuiteGr.query();

        if (!upgradeSuiteGr.hasNext()) {
            result.status = "norecord";
            return result;
        }

        var hadError = false;
        var hadProgress = false;
        while (upgradeSuiteGr.next()) {
            var testSuiteId = upgradeSuiteGr.getValue('atf_test_suite_id');
            var testSuiteSysId = upgradeSuiteGr.getValue('sys_id');

            result.testSuites.push(testSuiteId);
            result.upgradeTestSuiteSysIds.push(testSuiteSysId);

            // Look for the latest sys_atf_test_suite_result
            // var resultGr = new GlideRecord('sys_atf_test_suite_result');
            // resultGr.addQuery('test_suite', testSuiteId);
            // resultGr.orderByDesc('sys_created_on');
            // resultGr.setLimit(1);
            // resultGr.query();


            // if (resultGr.next()) {
            //     // Record found update it with the suiteResult.
            //     var suiteResultId = resultGr.getValue('sys_id');
            //     upgradeSuiteGr.setValue('suite_execution_id', suiteResultId);
            //     upgradeSuiteGr.update();
            //     gs.info("Updated suite_execution_id for: " + testSuiteId);
            // } else {
            // Start execution of Test Suite
            var runResult = this.runCICDTestSuite(testSuiteId, true);
            gs.info('Run OnLoad TestsSuite ProgressID: ' + runResult);
            if (runResult != null) {
                gs.info('Run OnLoad TestsSuite ' + testSuiteSysId + ' with ProgressId: ' + runResult);
                gs.eventQueue('sn_upgrade_mgmt.testsuite_execute', null, testSuiteSysId, runResult);
                hadProgress = true;
            } else {
                hadError = true;
                gs.warn('Failed to trigger test suite run for ' + testSuiteSysId);
            }
            // }
        }
        if (hadProgress) {
            result.status = 'progress';
        } else if (hadError) {
            result.status = 'error';
        } else {
            result.status = 'complete';
        }
        return result;
    },

    runCICDTestSuite: function(testSuite, inCloud) {
        var executeTestSuite = sn_atf.UserTestSuiteExecutor();
        executeTestSuite.setTestSuiteSysId(testSuite);
        executeTestSuite.setTestRunnerSessionId("cloud");
        executeTestSuite.setUseCloudRunner(inCloud);
        var executionTrackerSysId = executeTestSuite.start();
        return executionTrackerSysId;
    },

    runSelectedTestSuites: function(session_id, selectedRecords, exceptedRecords) {
        // gs.info('-runSelectedTestSuites- sessionID : ' + session_id);
        // gs.info('-runSelectedTestSuites- selectedRecords : ' + selectedRecords.length + '----' + selectedRecords + '----');
        // gs.info('-runSelectedTestSuites- exceptedRecords : ' + exceptedRecords.length + '----' + exceptedRecords + '----');
        var result = {
            status: ''
        };
        var cloudUserSet = false;
        if (gs.getProperty('sn_atf_tg.username')) {
            cloudUserSet = true;
        }
        var setValue = gs.getProperty('sn_atf.runner.enabled');
        var atfEnabled = (setValue.toLowerCase() === "true");
        var atfInstalled = this.checkIfATFInstalled();


        result.cloudUserDefined = cloudUserSet;
        result.atfEnabled = atfEnabled;
        result.atfInstalled = atfInstalled;

        var gr = new GlideRecord('sn_upgrade_mgmt_post_upgrade_suite');
        var testSuiteIDs = [];
        var testSuiteSysId = [];

        if (selectedRecords && selectedRecords.length > 0) {
            // Case 1: selectedRecords provided
            for (var i = 0; i < selectedRecords.length; i++) {
                gr.get(selectedRecords[i]);
                var testSuiteId = gr.getValue('a_atf_test_suite_id');
                var sysId = gr.getValue('a_sys_id');
                if(gr.getValue("c_status") && gr.getValue("c_status") !== "running") {
					testSuiteIDs.push(testSuiteId);
					testSuiteSysId.push(sysId);
				}
            }
        } else {
            // Case 2 & 3: selectedRecords empty — fetch based on sessionId
            gr.addQuery('a_upgrade_session_id', session_id);
            if (exceptedRecords && exceptedRecords.length > 0) {
                gr.addQuery('sys_id', 'NOT IN', exceptedRecords.join(','));
            }
            gr.query();
            while (gr.next()) {
                var testSuiteId = gr.getValue('a_atf_test_suite_id');
                var sysId = gr.getValue('a_sys_id');
                if(gr.getValue("c_status") && gr.getValue("c_status") !== "running") {
					testSuiteIDs.push(testSuiteId);
                	testSuiteSysId.push(sysId);
				}
            }
        }

        // Execute all test suites gathered
        for (var i = 0; i < testSuiteIDs.length; i++) {
            var suiteGr = new GlideRecord('sn_um_upgrade_test_suites');
            suiteGr.addQuery('sys_id', testSuiteSysId[i]);
            suiteGr.addQuery('upgrade_session_id', session_id);
            suiteGr.query();

            if (suiteGr.next()) {
                suiteGr.setValue('suite_execution_id', '');
                suiteGr.update();
            }
			
            var runResult = this.runCICDTestSuite(testSuiteIDs[i], true);
            if (runResult != null) {
                result.status = 'progress';
                gs.info('Run TestSuite ' + testSuiteSysId[i] + ' with ProgressId: ' + runResult);
                gs.eventQueue('sn_upgrade_mgmt.testsuite_execute', null, testSuiteSysId[i], runResult);
            } else {
                result.status = 'error';
                break;
            }
        }
        return result;
    },

    type: 'UpgradeManagementATFUtil'
};
