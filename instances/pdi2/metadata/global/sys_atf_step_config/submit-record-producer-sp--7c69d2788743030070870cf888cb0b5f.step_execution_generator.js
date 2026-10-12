(function(step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
		var FAILED_NO_G_FORM = "FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values";
		var FAILED_SUBMIT = "FAILURE: Failed to submit the record producer.";
		var SUCCESS_SUBMIT = "Successfully submitted and record created";
		var SUCCESS_OPEN = "Successfully submitted and record displayed";
		var SUCCESS_CONFIRM_BROWSER_BLOCK = "Successfully confirmed that browser blocks submission of record producer";
		var FAILED_BROWSER_BLOCK_SUBMIT = "FAILURE: Browser failed to block submission of record producer";
		var MESSAGE_KEY_UNKNOWN_ASSERT_TYPE = "FAILURE: Assert type cannot be empty";

		var gs = new GwtMessage();
		var messageMap = gs.getMessages(["FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values"],
						["FAILURE: Failed to submit the record producer."],
						["Successfully submitted and record created"],
						["Successfully submitted and record displayed"],
						["Successfully confirmed that browser blocks submission of record producer"],
						["FAILURE: Browser failed to block submission of record producer"],
						["FAILURE: Assert type cannot be empty"]);
		var gFormCheckCount = 0;

		function message(msg) {
			return g_ui_testing_util.setTestStepStatusMessage(msg);
		}

		function onError(msg) {
			msg = messageMap[msg];
			message(msg);
			stepResult.message = msg;
			stepResult.success = false;
			step.defer.reject();
		}

		function onSuccess(msg) {
			msg = messageMap[msg];
			message(msg);
			stepResult.message = msg;
			stepResult.success = true;
			step.defer.resolve();
		}

		var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

		function ensureGform() {
			if (gFormCheckCount === 10) {
				onError(formatMessage(FAILED_NO_G_FORM));
				return false;
			}

			gFormCheckCount++;

			if (g_ui_testing_util.getTestIFrameWindow().g_form)
				return true;

			window.setTimeout(ensureGform, 2000);
		}

		function getCatalog() {
			var $q = g_ui_testing_util.q();
			var deferred = $q.defer();
			var count = 0;
			var interval = setInterval(function() {
				if (typeof testFrameWindow.catalog_util == 'undefined') {
					count++;
					if (count >= 5) {
						clearInterval(interval);
						deferred.reject(FAILED_NO_G_FORM);
					}

				} else {
					clearInterval(interval);
					deferred.resolve(testFrameWindow.catalog_util);
				}
			}, 100);
			return deferred.promise;
		}

		function openStdChangeForm(inputData) {
			if (typeof inputData.redirect_portal_url === "undefined" || inputData.table !== "change_request")
				return false;

			var genURL = new URL(window.location.origin + "/" + inputData.redirect_portal_url).searchParams;

			step.timeout = step.timeout || 5;
			var wait_timeout_ms = step.timeout * 1000;

			var query_params = {};
			query_params.table = inputData.table;
			query_params.sys_id = -1;
			query_params.query = genURL.get("query");

			g_ui_testing_util.openPortalPage("sp", "form", query_params, wait_timeout_ms);
			return ensureGform();
		}

		function assert(catalogUtil) {
			var assertType = step.inputs.assert_type;

			catalogUtil.submit(step.timeout * 1000).then(function(result) {
				if (assertType == "form_submitted_to_server") {
					if (typeof result.number == "undefined") {
						if (!openStdChangeForm(result)) {
							stepResult.outputs.table = undefined;
							stepResult.outputs.record_id = undefined;
							onError(FAILED_SUBMIT);
						} else {
							stepResult.outputs.table = result.table;
							stepResult.outputs.record_id = result.sys_id;
							onSuccess(SUCCESS_OPEN);
						}
					} else {
						stepResult.outputs.table = result.table;
						stepResult.outputs.record_id = result.sys_id;
						onSuccess(SUCCESS_SUBMIT);
					}
				} else if (assertType == "form_submission_cancelled_in_browser") {
					stepResult.outputs.table = undefined;
					stepResult.outputs.record_id = undefined;
					onError(FAILED_BROWSER_BLOCK_SUBMIT);
				} else {
					message = messageMap(MESSAGE_KEY_UNKNOWN_ASSERT_TYPE);
					stepResult.success = false;
					stepResult.message = message;
					step.defer.reject();
				}

			}, function() { //error case
				if (assertType == "form_submitted_to_server") {
					stepResult.outputs.table = undefined;
					stepResult.outputs.record_id = undefined;
					onError(formatMessage(FAILED_SUBMIT));
				} else if (assertType == "form_submission_cancelled_in_browser") {
					stepResult.outputs.table = undefined;
					stepResult.outputs.record_id = undefined;
					onSuccess(formatMessage(SUCCESS_CONFIRM_BROWSER_BLOCK));
				} else {
					message = messageMap(MESSAGE_KEY_UNKNOWN_ASSERT_TYPE);
					stepResult.success = false;
					stepResult.message = message;
					step.defer.reject();
				}
			});

		}
		getCatalog().then(assert, onError);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
