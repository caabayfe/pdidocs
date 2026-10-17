(function (step, stepResult, assertionObject) {
  assertionObject.executeStep = function(step, stepResult) {
	var FAILED_NO_G_FORM = "FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values";
	var FAILED_BROWSER_BLOCK_SUBMIT = "FAILURE: Browser blocked submission of '{0}' form to server";
	var FAILED_SUBMIT = "FAILURE: {0} Form Submission Failed";
	var FAILED_SUBMIT_2 = "FAILURE: {0} Form Submission Failed using sys_id {1}";
	var SUCCESS_SUBMIT = "Successfully submitted '{0}' form for record with sys_id '{1}'";
	var SUCCESS_SUBMIT_2 = "Successfully submitted '{0}' form";
	var SUCCESS_CONFIRM_BROWSER_BLOCK = "Successfully confirmed that browser blocks submission of '{0}' form to server";
	var CHECKING_SUBMIT_STATE = "Checking if form submit was successful";
	
	var map = new GwtMessage().getMessages([FAILED_NO_G_FORM, FAILED_BROWSER_BLOCK_SUBMIT, FAILED_SUBMIT, FAILED_SUBMIT_2, SUCCESS_SUBMIT, SUCCESS_SUBMIT_2, SUCCESS_CONFIRM_BROWSER_BLOCK, CHECKING_SUBMIT_STATE]);

	function message(msg) {
		return g_ui_testing_util.setTestStepStatusMessage(msg);
	}

	function onError(msg) {
		message(msg);
		stepResult.message = msg;
		stepResult.success = false;
		step.defer.reject();
	}

	function onSuccess(msg) {
		message(msg);
		stepResult.message = msg;
		stepResult.success = true;
		step.defer.resolve();
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

	function getForm() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		step.timeout = step.timeout || 5;
		var interval = setInterval(function() {
			if (typeof testFrameWindow.g_form == 'undefined') {
				count++;
				if (count >= step.timeout) {
					clearInterval(interval);
					deferred.reject(FAILED_NO_G_FORM);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.g_form);	
			}
		}, 1000);
		return deferred.promise;	
	}

	function checkRecord(table, sysId) {
		var gr = new GlideRecord(table);
		var success = gr.get(sysId);
		if (success) {
			stepResult.outputs.record_id = sysId;
			return false;
		}
		return true;
	}

	function hasValidationScriptState(testFrameWindow) {
		return testFrameWindow.NOW.validationScriptState && Object.keys(testFrameWindow.NOW.validationScriptState).length > 0;
	}
	
	function checkFormValidation(form, sysId, errors, responseSysId) {
		var table = form.getTableName();
		var assertType = step.inputs.assert_type;
		stepResult.outputs.table = table;
		stepResult.outputs.record_id = sysId;
		var formNotSubmittedByValidators = !hasValidationScriptState(testFrameWindow);
		if (!errors && !formNotSubmittedByValidators)
			errors = checkRecord(table, responseSysId);

		if (assertType === "form_submission_canceled_in_browser") {
			if (errors) {
				onSuccess(formatMessage(map[SUCCESS_CONFIRM_BROWSER_BLOCK], table));
			} else {
				onError(formatMessage(map[FAILED_BROWSER_BLOCK_SUBMIT], table));
			}
		} else if (assertType === "form_submitted_to_server") {
			if (errors) {
				onError(formatMessage(map[FAILED_BROWSER_BLOCK_SUBMIT], table));
			} else {
				if (formNotSubmittedByValidators)
					submit(table, sysId);
				else
					onSuccess(formatMessage(map[SUCCESS_SUBMIT], table));
			}
		} else {
			if (!errors)
				testFrameWindow.g_form.atfSubmit(sysId);
			onSuccess(formatMessage(map[SUCCESS_SUBMIT_2], table));
		}
	}

	function assert(form) {
		var sysId = form.getSysId();
		var actionName = sysId.length > 2 ? 'sysverb_update' : 'sysverb_insert';
		form.$private.userState.setRunningAction(actionName);
		var errors = !form.$private.validateForm(actionName);
		var table = form.getTableName();
		if (hasValidationScriptState(testFrameWindow)) {
			form.$private.events.on('propertyChange', function(type, fieldName, propertyName, propertyValue) {
				if (propertyName == "errorMessage")
					checkFormValidation(form, sysId, true);
			});
			form.$rootScope.$on('sp.form.submitted', function(e, status) {
					checkFormValidation(form, sysId, false, status.sys_id);
			});
		} else
			checkFormValidation(form, sysId, errors);
	}

	function submit(table, sysId) {
		return testFrameWindow.g_form.atfSubmit(sysId).then(function(status) {	
			message(map[CHECKING_SUBMIT_STATE]);			
			var gr = new GlideRecord(table);
			var success = gr.get(status.sys_id);
			if (success) {
				stepResult.outputs.record_id = status.sys_id;
				onSuccess(formatMessage(map[SUCCESS_SUBMIT], table, status.sys_id));
			} else {
				if (status.sys_id > -1) {
					 onError(formatMessage(map[FAILED_SUBMIT_2], table, status.sys_id));
				} else {
					onError(formatMessage(map[FAILED_SUBMIT], table));
				}
			}
		});
	}
	
	getForm().then(assert, onError);

  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
