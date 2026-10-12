var TestExecutorAjax = Class.create();
TestExecutorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process: function() {
	    var name = this.getParameter('sysparm_name');
		if (name == 'claimTest')
		    return this.claimTest();
		else if (name == 'decodeFieldValues')
			return this.decodeFieldValues();
		else if (name == 'addTestsToTestSuite')
		    return this.addTestsToTestSuite();
		else if (name == 'findOldestScheduledTest')
			return this.findOldestScheduledTest();
		else if (name == 'resolveInputs')
			return this.resolveInputs();
		else if (name == 'getStepOutputs')
			return this.getStepOutputs();
		else if (name == 'resolveStepOutputPath')
			return this.resolveStepOutputPath();
		else if (name == 'getParameterValues')
			return this.getParameterValues();
		else if (name == 'resolveParameterPath')
			return this.resolveParameterPath();
		else if (name =='validateFormParameters')
			return this.validateFormParameters();
		else if (name == 'resolveUserId')
			return this.resolveUserId();
		else if (name == 'impersonate')
			return this.impersonate();
		else if (name == 'unimpersonate')
			return this.unimpersonate(this.getParameter("sysparm_expected_user_id"));
		else if (name == 'getDisplay')
			return this.getDisplay();
		else if (name == 'isImpersonating')
			return this.isImpersonating();
		else if (name == 'uploadAttachments')
			return this.uploadAttachments();
		else if (name == 'copyAttachmentToRecord')
			return this.copyAttachmentToRecord();
		else if (name == "getWorkspaceName")
			return this.getWorkspaceName(this.getParameter("sysparm_workspace_slug"));
		else if (name == "extendsTable")
			return this.extendsTable(this.getParameter("sysparm_table"), this.getParameter("sysparm_parent"));
		else if (name == "pauseTest")
			return this.pauseTest(this.getParameter("sysparm_test_result_id"));
		else if (name == "unpauseTest")
			return this.unpauseTest(this.getParameter("sysparm_test_result_id"));
		else if (name == "stepOver")
			return this.stepOver(this.getParameter("sysparm_test_result_id"));
		else if (name == "getPauseInfo")
			return this.getPauseInfo(this.getParameter("sysparm_test_result_id"));
		else if (name == "getServerErrors")
			return this.getServerErrors(this.getParameter("sysparm_test_result_id"));
		else if (name == "startSessionDebug")
			return this.startSessionDebug();
		else if (name == "endSessionDebug")
			return this.endSessionDebug();
		else if (name == "collectSessionStatsMetrics")
			return this.collectSessionStatsMetrics(this.getParameter("sysparm_test_step_id"), this.getParameter("sysparm_test_result_id"));
		else if (name == "canRunTestInSession")
			return this.canRunTestInSession();

		var utTestSysId = this.getParameter("sysparm_ajax_processor_ut_test_id");
		var utTestSuiteId = this.getParameter("sysparm_ajax_processor_ut_test_suite_id");
		var trackerId = this.getParameter("sysparm_ajax_processor_tracker_id");
		var testResultId = this.getParameter("sysparm_ajax_processor_test_result_id");
		var testSuiteResultId = this.getParameter("sysparm_ajax_processor_test_suite_result_id");
		var isPerformanceRun = this.getParameter("sysparm_ajax_processor_performance_run");

		if (this.getType() == 'cancelTestRun')
			return this.cancelTestRun(trackerId);
		if (this.getType() == 'killTestRun')
			return this.killTestRun(trackerId);


		if (utTestSuiteId)
			return this.runUserTestSuite(utTestSuiteId);

		if (utTestSysId)
			return this.runUserTest(utTestSysId);
		
		if (testResultId) {
			if (isPerformanceRun)
				return this.getTrackerIdFromPerformanceResult(testResultId);

		return this.getTrackerIdFromTestResult(testResultId);
		}
		
		if (testSuiteResultId)
			return this.getTrackerIdFromTestSuiteResult(testSuiteResultId);
	},

	getTrackerIdFromPerformanceResult: function(testResultId) {
		var gr = new GlideRecord('sys_atf_performance_run');
		if (!gr.get(testResultId)) {
			gs.log("Could not find performance run result with id: " + testResultId);
			return;
		}
		return gr.execution_tracker;
	},
	
	getTrackerIdFromTestResult: function(testResultId) {
		var gr = new GlideRecord('sys_atf_test_result');
		if (!gr.get(testResultId)) {
			gs.log("Could not find test result with id: " + testResultId);
			return;
		}
		return gr.execution_tracker.sys_id;
	},

	getTrackerIdFromTestSuiteResult: function(testSuiteResultId) {
		var gr = new GlideRecord('sys_atf_test_suite_result');
		if (!gr.get(testSuiteResultId)) {
			gs.log("Could not find test result with id: " + testResultId);
			return;
		}
		return gr.execution_tracker.sys_id;
	},

	claimTest: function() {
		var test_result_sys_id = this.getParameter('sysparm_test_result_sys_id');
		var ui_batch_execution_tracker_sys_id = this.getParameter('sysparm_batch_execution_tracker_sys_id');
		var batch_length = this.getParameter('sysparm_batch_length');

		return new sn_atf.TestClaimer()
		.setATFTestRecordSysId(test_result_sys_id)
		.setUIBatchTrackerSysId(ui_batch_execution_tracker_sys_id)
		.setBatchLength(batch_length)
		.claim();
	},

	/**
	 * Queries for a test to be executed by the test runner
	 * by matching the message reference passed with the test result's message_reference
	 * If a test to be executed is found, tries to claim the test
	 * If successful, returns the test case json string
	 * If not, returns null
	 */
	findOldestScheduledTest: function() {
		var userName = this.getParameter("sysparm_user_name");
		var messageReference = this.getParameter("sysparm_message_reference");
		if (!messageReference) {
			gs.log("TestExecutorAjax.findOldestScheduledTest has no message reference argument");
			return null;
		}
		//finds the oldest scheduled test and returns its test_case_json (or null if none found)
		gs.log("TestExecutorAjax looking for a scheduled test to run for user: " + userName + ", message reference: " + messageReference);
		var gr = new GlideRecord('sys_atf_test_result');
		gr.addQuery('status', 'waiting');
		var isCloudRunner = this.getParameter("sysparm_cloud_runner") == "true";
		var rootTrackerId = this.getParameter("sysparm_root_tracker_id");
		// cloud runners match on 'cloud' message reference and the root tracker id
		if (isCloudRunner) {
			gr.addQuery('message_reference', 'cloud');
			gr.addQuery('root_tracker_id', rootTrackerId);
		} else
			gr.addQuery('message_reference', messageReference);

		gr.orderBy('sys_created_on');
		gr.query();
		if (gr.next()) {
			//found a test to run, try to claim it
			var testResultSysId = gr.getUniqueValue();
			var testCaseJSONString = gr.getValue('test_case_json');
			var testCaseJSON = JSON.parse(testCaseJSONString);
			var uiBatchTrackerSysId = testCaseJSON.tracker_sys_id;
			var successfulClaim = new sn_atf.TestClaimer()
				.setATFTestRecordSysId(testResultSysId)
				.setUIBatchTrackerSysId(uiBatchTrackerSysId)
				.setBatchLength(testCaseJSON.sys_atf_steps.length)
				.claim();
			if (successfulClaim) {
				gs.log("Successfully claimed scheduled test " + testResultSysId);
				return testCaseJSONString;
			} else {
				gs.log("TestExecutorAjax tried to claim a scheduled test, but was not successful");
				return null;
			}
		} else {
			gs.log("TestExecutorAjax did not find any tests in the 'waiting' state");
			return null;
		}
	},

	runUserTestSuite: function(utTestSuiteId) {
		var testRunnerSessionId = this.getParameter('sysparm_ajax_processor_test_runner_session_id');
		gs.log("TestexecutorAjax runUserTestSuite called with test runner session id: " + testRunnerSessionId);
		var gr = new GlideRecord('sys_atf_test_suite');
		if (!gr.get(utTestSuiteId)) {
			gs.log("Could not find the Test suite with id: " + utTestSuiteId);
			return;
		}

		if (!this.canRunTestInSession()) {
			gs.log("Running tests and test suites is disabled while impersonating another user. Unable to run suite with id:" + utTestSuiteId);
			return;
		}

		var executor;
		var previousSuiteResultId = this.getParameter("sysparm_ajax_processor_previous_suite_result_id");
		var isPausingEnabled = "true" == this.getParameter('sysparm_ajax_processor_is_pausing_enabled');
		var pauseBeforeRollback = "true" == this.getParameter('sysparm_ajax_processor_pause_before_rollback');
		var useCloudRunner = "true" == this.getParameter('sysparm_ajax_processor_use_cloud_runner');
		var performanceRun = "true" == this.getParameter('sysparm_ajax_processor_performance_run');
		var captureNodeLogs = "true" == this.getParameter('sysparm_ajax_processor_capture_node_logs');
		if (previousSuiteResultId) {
			executor = new sn_atf.RerunTestSuiteExecutor();
			executor.setIsPerformance(performanceRun);
			executor.setTestSuiteSysId(utTestSuiteId);
			executor.setTestRunnerSessionId(testRunnerSessionId);
			executor.setRerunSuiteResultId(previousSuiteResultId);
			executor.setUseCloudRunner(useCloudRunner);
			executor.setCaptureNodeLogs(captureNodeLogs);
			return executor.start();
		}
		else {
			executor = new sn_atf.UserTestSuiteExecutor();
			executor.setIsPerformance(performanceRun);
			executor.setTestSuiteSysId(utTestSuiteId);
			executor.setTestRunnerSessionId(testRunnerSessionId);
			executor.setPausingEnabled(isPausingEnabled, pauseBeforeRollback);
			executor.setUseCloudRunner(useCloudRunner);
			executor.setCaptureNodeLogs(captureNodeLogs);
			return executor.start();
		}
	},

	runUserTest: function(utTestSysId) {
		var testRunnerSessionId = this.getParameter('sysparm_ajax_processor_test_runner_session_id');
		gs.log("TestexecutorAjax runUserTest called with test runner session id: " + testRunnerSessionId);
		var gr = new GlideRecord('sys_atf_test');
		if (!gr.get(utTestSysId)) {
			gs.log("couldn't find the Test record with id: " + utTestSysId);
			return;
		}

		if (!this.canRunTestInSession()) {
			gs.log("Running tests and test suites is disabled while impersonating another user. Unable to run test with id:" + utTestSysId);
			return;
		}

		var capturePageData = "true" == this.getParameter('sysparm_ajax_processor_page_data_capture');
		var retrieveComponentsStep = this.getParameter('sysparm_ajax_processor_retrieve_components_step');
		var isPausingEnabled = "true" == this.getParameter('sysparm_ajax_processor_is_pausing_enabled');
		var pauseBeforeRollback = "true" == this.getParameter('sysparm_ajax_processor_pause_before_rollback');
		var useCloudRunner = "true" == this.getParameter('sysparm_ajax_processor_use_cloud_runner');
		var performanceRun = "true" == this.getParameter('sysparm_ajax_processor_performance_run');
		var captureNodeLogs = "true" == this.getParameter('sysparm_ajax_processor_capture_node_logs');

		return new sn_atf.ExecuteUserTest()
		.setIsPerformance(performanceRun)
		.setCapturePageData(utTestSysId, capturePageData)
		.setRetrieveComponentsStep(utTestSysId, retrieveComponentsStep)
		.setTestRecordSysId(utTestSysId)
		.setTestRunnerSessionId(testRunnerSessionId)
		.setPausingEnabled(isPausingEnabled, pauseBeforeRollback)
		.setUseCloudRunner(useCloudRunner)
		.setCaptureNodeLogs(captureNodeLogs)
		.start();
	},
	
	cancelTestRun: function(trackerId) {
		return sn_atf.AutomatedTestingFramework.cancelTestRun(trackerId);
	},
	
	killTestRun: function(trackerId) {
		return sn_atf.AutomatedTestingFramework.killTestRun(trackerId, false); // false means the kill request is not sent from cluster message
	},

    /*
    * Converts an encoded query (condition) into a list of field/value pairs to be used when setting a value in a
    * client script via g_form.setValue.  This code builds on top of the template feature which performs nearly
    * identical operations.
    */
	decodeFieldValues: function() {
		var table = this.getParameter('sysparm_table_name');
		var encodedQuery = this.getParameter('sysparm_field_values');
		
		// Use GlideTemplate so we can re-use existing code.
		var fakeTemplateGR = new GlideRecord("sys_template");
		fakeTemplateGR.setValue("template", encodedQuery);
		fakeTemplateGR.setValue("next_child",false);
		fakeTemplateGR.setValue("table",table);
		
		// GlideTemplate is a Java class used when applying templates from the UI
		var glideTemplate = GlideTemplate.getFromRecord(fakeTemplateGR);
		glideTemplate.setApplyChildren(false); // n/a for this use case
		var targetGR = glideTemplate.apply();
		var fieldList = glideTemplate.getTemplateElements();
		// Template is a Ajax script include used when applying templates
		var template = new Template();
		for (var i = 0; i < fieldList.size(); i++) {
			var fieldName = fieldList.get(i);
			var ge = targetGR.getElement(fieldName);
			if (ge.getED().isVirtual())
				continue;

			var value = template.getValue(ge);

		    var fieldValue = this.newItem("fieldValue");
			fieldValue.setAttribute("field", fieldName);
			fieldValue.setAttribute("value", value);
	    }
	},
	
	resolveInputs: function() {
		var resultId = this.getParameter("sysparm_atf_test_result");
		var stepId = this.getParameter("sysparm_atf_step_id");
		var parameterSetOrder = this.getParameter("sysparm_atf_parameter_set_order");
		var callableStepResult = this.getParameter("sysparm_atf_callable_step_result_id");
		var testProcessor = new sn_atf.UserTestProcessor();
		return testProcessor.generateStepJSON(stepId, resultId, parameterSetOrder, callableStepResult);
	},

	/**
	 * Returns a JSON object mapping each completed step's sys_id to its output variable values.
	 * Called synchronously by the Client Script Test step_execution_generator right before the
	 * test script runs, so that steps(stepSysId) returns up-to-date outputs.
	 */
	getStepOutputs: function() {
		var resultId = this.getParameter("sysparm_atf_test_result");
		var testProcessor = new sn_atf.UserTestProcessor();
		return testProcessor.getStepOutputsJSON(resultId);
	},

	/**
	 * Resolves a dot-walk path rooted at a named output of a completed step.
	 * The first segment of sysparm_path is the output variable name; subsequent
	 * segments traverse reference fields server-side. Returns the leaf display value
	 * or an empty string if any segment cannot be resolved.
	 *
	 * Called synchronously by the client-side steps() Proxy in UI Test Scripts to
	 * support steps('id').user.department.name dotwalking syntax.
	 */
	resolveStepOutputPath: function() {
		var resultId         = this.getParameter('sysparm_atf_test_result');
		var stepId           = this.getParameter('sysparm_step_id');
		var path             = this.getParameter('sysparm_path');
		var parentStepResult = this.getParameter('sysparm_atf_callable_step_result_id') || null;
		var testProcessor    = new sn_atf.UserTestProcessor();
		return testProcessor.resolveStepOutputPath(resultId, stepId, path, parentStepResult);
	},

	/**
	 * Returns a JSON object mapping each parameter name to its value for the active
	 * parameter set of the current test run. Covers both exclusive and shared parameters.
	 * Called synchronously by the UI Test Script step_execution_generator right before the
	 * test script runs, so that params(paramName) returns the correct value for each set.
	 *
	 * When sysparm_atf_parameter_set_order is provided the server resolves the parameter set
	 * by order directly (bypassing the parameter_set_run reference chain). Falls back to the
	 * reference chain lookup when the order is absent (non-parameterized runs).
	 */
	getParameterValues: function() {
		var resultId = this.getParameter("sysparm_atf_test_result");
		var orderStr = this.getParameter("sysparm_atf_parameter_set_order");
		var order = (orderStr !== null && orderStr !== '' && orderStr !== undefined) ? parseInt(orderStr, 10) : -1;
		if (isNaN(order)) order = -1;
		return new sn_atf.UserTestProcessor().getParameterValuesJSON(resultId, order);
	},

	/**
	 * Resolves a dot-walk path rooted at a named parameter of the active parameter set.
	 * sysparm_path is the reference chain to traverse from the parameter's value (e.g.
	 * "department.name"); an empty path returns the raw parameter value. Returns the leaf
	 * display value or an empty string if any segment cannot be resolved.
	 *
	 * Called synchronously by the client-side params() Proxy in UI Test Scripts to
	 * support params('assigned_to').department.name dotwalking syntax.
	 */
	resolveParameterPath: function() {
		var resultId  = this.getParameter('sysparm_atf_test_result');
		var orderStr  = this.getParameter('sysparm_atf_parameter_set_order');
		var order     = (orderStr !== null && orderStr !== '' && orderStr !== undefined) ? parseInt(orderStr, 10) : -1;
		if (isNaN(order)) order = -1;
		var paramName = this.getParameter('sysparm_param_name');
		var path      = this.getParameter('sysparm_path') || '';
		return new sn_atf.UserTestProcessor().resolveParameterPath(resultId, order, paramName, path);
	},
	
	addTestsToTestSuite: function() {
	    var testSuiteId = this.getParameter("sysparm_atf_test_suite_id");
		var testIds = this.getParameter("sysparm_atf_test_ids");
		var testQuery = this.getParameter("sysparm_atf_test_query");
		var testsToAdd = [];
		if (testIds)
			testsToAdd = testIds.split(",");
		else {
			var testGR = new GlideRecord('sys_atf_test');
			if (testQuery)
				testGR.addEncodedQuery(testQuery);

			testGR.query();
			while (testGR.next())
				testsToAdd.push(testGR.getValue('sys_id'));

		}
		var testSuiteProcessor = new sn_atf.TestSuiteProcessor();
		return testSuiteProcessor.addTestsToTestSuite(testSuiteId, testsToAdd);
	},

	/**
	* Validates the table, view and sys_id provided as parameters to the open a new form and open an existing form steps
	* If all three are valid, returns true. If not, it returns the the message invalid table/view/sys id
	*/
	validateFormParameters: function() {
		var formView = this.getParameter('sysparm_view_name');
		var formTable = this.getParameter('sysparm_table_name');
		var sysId = this.getParameter('sysparm_sys_id');
		gs.log("TestExecutorAjax validateFormParameters called with table: " + formTable + ", view: " + formView + ", sysId: " + sysId);

		var gr = new GlideRecord(formTable);
		if (!gr.isValid()) {
			gs.log("TestExecutorAjax validateFormParameters: Invalid table name: " + formTable);
			return "invalid table";
		}
		if (!this.validateFormView(formView, formTable)) {
			gs.log("TestExecutorAjax validateFormParameters: Invalid view: " + formView + " for table " + formTable);
			return "invalid view";
		}
		if (sysId && !gr.get(sysId)) {
			gs.log("TestExecutorAjax validateFormParameters: Invalid sysId: " + sysId + " for table " + formTable);
			return "invalid sys id";
		}
		return true;
	},

	validateFormView: function(formView, formTable) {
		if(GlideStringUtil.nil(formView) || formView.toLowerCase() == "default")
			return true;

		var viewManager = new GlideScriptViewManager(null);
		viewManager.setTable(formTable);
		viewManager.setTarget("section");
		var cl = viewManager.getList();
		return cl.contains(formView);
	},

	/**
	 * Resolves a user identifier (sys_id or user_name) to a sys_id.
	 * sys_ids are 32 lowercase hex chars and are returned as-is.
	 * Anything else is treated as a user_name and looked up via GlideUser.getSysId.
	 * Returns the resolved sys_id, or "" if not found.
	 */
	resolveUserId: function() {
		if (!sn_atf.AutomatedTestingFramework.isValidATFUser()) return '';
		var userIdentifier = this.getParameter('sysparm_user_identifier');
		if (/^[0-9a-f]{32}$/.test(userIdentifier)) {
			return userIdentifier;
		}
		return GlideUser.getSysId('user_name', userIdentifier) || '';
	},

	impersonate: function() {
		var impersonatingUser = this.getParameter("sysparm_impersonating_user");
		gs.log("TestExecutorAjax impersonate called with impersonating user: " + impersonatingUser);
		if (gs.getUserID() != impersonatingUser)
			gs.getSession().onlineImpersonate(impersonatingUser);

		// Return the currently logged in user Id so that impersonation outcome can be verified
		return gs.getUserID();
	},

	unimpersonate: function(expectedUserID) {
		if (!expectedUserID)
			expectedUserID = "";

	    gs.log("TestExecutorAjax unimpersonating");

		if (gs.getProperty("sn_atf.runner.unimpersonate_v2", true)) {
			var result = sn_atf.ImpersonateAPI.teardownImpersonation(expectedUserID);
			if (result != "success")
				return "";
			return gs.getUserID();
		}

		// Only unimpersonate if there is currently an impersonation. In case onlineUnimpersonate was ran before then 
		// we do not need to unimpersonate again as this will put the instance in a bad state
		if(this.isImpersonating()) {
			gs.getSession().onlineUnimpersonate();
			// Return the currently logged in user Id so that we can verify if unimpersonation was successful
			return gs.getUserID();
		} else {
		    return "";
		}
	},

	isImpersonating: function() {
		return (new GlideImpersonate()).isImpersonating();
	},

	/**
	 * Returns a choice list of supported Jasmine versions for use with the "Run Server Side Script" test step.
	 */
	getJasmineChoiceList: function() {
		var str = GlidePropertiesDB.get('sn_atf.jasmine.versions', '3.1');
		var splitstr = str.split(',');
		var list = new GlideChoiceList();
		splitstr.forEach(function(item) {
			list.add(new GlideChoice(item, item));
		});
		return list;
	},

	getDisplay: function() {
		return getDisplayValueOf(this.getParameter('sysparm_table'),this.getValue());
	},

	/**
	 * Client-callable API for uploading attachments in an ATF context
	 * Uses the attachments on the current step record, as well as a user-specified table and target_id (sys_id of the record to attach to)
	 */
	uploadAttachments: function() {
		var stepID = this.getParameter("sysparm_atf_step_sys_id");
		var table = this.getParameter("sysparm_table");
		var targetID = this.getParameter("sysparm_target_id");
		return sn_atf.AutomatedTestingFramework.uploadAttachments(stepID, table, targetID);
	},

	/**
	 * Copies a single sys_attachment record to a target table/record entirely on the server.
	 * Called by DTL's user.upload(sysId), user.copyAttachment(), user.uploadInSP(), and user.uploadInWS() — no file bytes cross the wire.
	 *
	 * Uses GlideSysAttachment to read the source bytes and write them to the target record.
	 * The target record does not need to exist in the DB (supports new-record GUIDs).
	 *
	 * Returns JSON: { sys_id, name } on success, { error } on failure.
	 */
	copyAttachmentToRecord: function() {
		var attachSysId = this.getParameter('sysparm_attachment_sys_id');
		var table       = this.getParameter('sysparm_table');
		var recordId    = this.getParameter('sysparm_record_id');

		if (!attachSysId || !table || !recordId)
			return JSON.stringify({ error: 'missing required parameters' });

		var srcGr = new GlideRecord('sys_attachment');
		if (!srcGr.get(attachSysId))
			return JSON.stringify({ error: 'attachment not found: ' + attachSysId });

		var fileName    = srcGr.getValue('file_name');
		var contentType = srcGr.getValue('content_type');

		// If a catalog variable name is provided, look up its constraints from item_option_new
		// and validate extension/size before copying.
		var variableName = this.getParameter('sysparm_variable_name');
		var allowedExtensions = this.getParameter('sysparm_allowed_extensions');
		var maxFileSizeMb     = this.getParameter('sysparm_max_file_size_mb');
		if (allowedExtensions) {
			var ext     = ('' + fileName).split('.').pop().toLowerCase().trim();
			var allowed = ';' + ('' + allowedExtensions).toLowerCase() + ';';
			if (allowed.indexOf(';' + ext + ';') === -1)
				return JSON.stringify({ error: 'The uploaded file type is not permitted; allowed types are ' + allowedExtensions });
		}
		if (maxFileSizeMb) {
			var maxBytes = parseFloat('' + maxFileSizeMb) * 1024 * 1024;
			var fileSize = parseInt('' + srcGr.getValue('size_bytes'), 10) || 0;
			if (fileSize > maxBytes)
				return JSON.stringify({ error: 'The size of the uploaded file cannot exceed ' + maxFileSizeMb + ' MB' });
		}

		try {
			var sa    = new GlideSysAttachment();
			var bytes = sa.getBytes(srcGr);

			// Build a GlideRecord for the target. The record does not need to exist —
			// GlideSysAttachment.write() only needs the table name and sys_id populated.
			// ZZ_YY tables (used by catalog attachment variables) cannot be queried via
			// GlideRecord.get() — skip the lookup and initialize directly with the sys_id.
			var targetGr = new GlideRecord(table);
			if (table.indexOf('ZZ_YY') === 0 || !targetGr.get(recordId)) {
				targetGr.initialize();
				targetGr.setValue('sys_id', recordId);
			}

			var newSysId = sa.write(targetGr, fileName, contentType, bytes);
			if (!newSysId)
				return JSON.stringify({ error: 'attachment copy failed — GlideSysAttachment.write returned empty' });

			return JSON.stringify({ sys_id: newSysId, name: fileName, size_bytes: parseInt(srcGr.getValue('size_bytes'), 10) || 0 });
		} catch(e) {
			return JSON.stringify({ error: 'copy failed: ' + e });
		}
	},

	getWorkspaceName: function(workspaceSlug) {
		var workspaceGr = new GlideRecord('sys_aw_master_config');
		workspaceGr.addQuery('workspace_url', workspaceSlug);
		workspaceGr.query();
		if (workspaceGr.next())
			return workspaceGr.getValue('name');
		else
			return gs.getMessage('Unknown');
	},

	/**
	 * Check if a table extends another table
	 * Since this is a publicly callable API without ACLs, only return a value if the session owner has rights to see both tables
	 */
	extendsTable: function(table, parent) {
		var tableGR = new GlideRecord(table);
		var parentGR = new GlideRecord(parent);

		// If either table is invalid or the session owner can't see one of them, return without even giving an answer
		if (!tableGR.isValid() || !parentGR.isValid() || !tableGR.canRead() || !parentGR.canRead())
			return;

		// Both tables are valid and the session owner can see both of them so return whether table extends parent
		return tableGR.instanceOf(parent);
	},

	/**
	 * Pauses a running test. Returns the maximum amount of time that the test can remain paused
	 */
	pauseTest: function(resultID) {
		sn_atf.ATFBreakpoint.pauseTest(resultID);
		return sn_atf.ATFBreakpoint.getMaximumPauseTime();
	},

	/**
	 * Unpause a paused test from a test result sys_id. If the test is not paused this has no side effects
	 */
	unpauseTest: function(resultID) {
		sn_atf.ATFBreakpoint.unpauseTest(resultID);
	},

	/**
	 * Step over the current step in a paused test from a test result sys_id. If the test is not paused this has no side effects
	 */
	stepOver: function(resultID) {
		sn_atf.ATFBreakpoint.stepOver(resultID);
	},

	/**
	 * Returns a stringified JSON object containing a "paused" property indicating if the test is paused or not,
	 * and a "pause_time_left" field indicating how much longer the test can stay paused (only if "paused" is true)
	 */
	getPauseInfo: function(resultID) {
		return JSON.stringify(sn_atf.ATFBreakpoint.getPauseInfo(resultID));
	},

	/**
	 * Gets all server errors caught by the test result with the specified sys_id that are unaccounted for
	 * If an error turns out to be ignored, the client test runner will update its status accordingly,
	 * and it won't be returned in subsequent calls of this function
	 */
	getServerErrors: function(resultID) {
		var errorsGR = new GlideRecord("sys_atf_test_result_item");
		errorsGR.addQuery("test_result", resultID);
		errorsGR.addQuery("type", "server_error");
		// Only look at errors with status "Failure"; if it turns out they're ignored, the client test runner will
		// change the state to "Ignored" or "Warning" and they won't be returned the next time this function is called
		errorsGR.addQuery("status", "failure");
		errorsGR.query();

		while (errorsGR.next()) {
			var item = this.newItem("server_error");
			item.setAttribute("sys_id", errorsGR.getUniqueValue());
			item.setAttribute("output", errorsGR.getValue("output"));
		}
	},

    /*
	 * Starts session debug for performance metrics for UI steps
	 */
	startSessionDebug: function() {
		GlideSessionDebug.enable("metric_stats");
	},

	/**
	 * Ends session debug for performance metrics for UI steps
	 */
	endSessionDebug: function() {
		GlideSessionDebug.disable("metric_stats");
	},

	/**
	 * Triggers ATF test execution engine to collect and insert session metrics
	 * if it is missing
	 */
	collectSessionStatsMetrics: function(testStepSysId, testResultSysId) {
		sn_atf.AutomatedTestingFramework.collectSessionStatsMetrics(testStepSysId, testResultSysId);
	},

	/**
	 * Returns true if you could run a test in the current session
	 */
	canRunTestInSession: function() {
		return sn_atf.ImpersonateAPI.canRunTestInSession();
	},

    type: 'TestExecutorAjax'
});
