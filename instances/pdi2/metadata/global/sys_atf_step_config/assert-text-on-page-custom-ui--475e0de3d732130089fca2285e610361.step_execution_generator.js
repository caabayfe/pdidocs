(function (step, stepResult, assertionObject) {
	assertionObject.executeStep = function (step, stepResult) {
	var MESSAGE_KEY_ASSERTING_TEXT_ON_PAGE = "Asserting that text is on the page";
	var MESSAGE_KEY_FAILED_NO_G_AUTOMATE = "FAILURE: Unable to assert text on page, g_automate was not defined";
	var MESSAGE_KEY_SUCCESSFULLY_ASSERT_ON_PAGE = "Successfully asserted text '{0}' was on the page";
	var MESSAGE_KEY_SUCCESSFULLY_ASSERT_NOT_ON_PAGE = "Successfully asserted text '{0}' was not on the page";
	var MESSAGE_KEY_FAILED_ASSERT_ON_PAGE = "FAILURE: Text '{0}' was not on the page.";
	var MESSAGE_KEY_FAILED_ASSERT_NOT_ON_PAGE = "FAILURE: Text '{0}' was on the page.";

	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_ASSERTING_TEXT_ON_PAGE, MESSAGE_KEY_FAILED_NO_G_AUTOMATE, MESSAGE_KEY_SUCCESSFULLY_ASSERT_ON_PAGE, MESSAGE_KEY_SUCCESSFULLY_ASSERT_NOT_ON_PAGE, MESSAGE_KEY_FAILED_ASSERT_ON_PAGE, MESSAGE_KEY_FAILED_ASSERT_NOT_ON_PAGE]);

	var text = step.inputs.text;
	var version = step.inputs.mugshot_version;
	var assertOnPage = step.inputs.assert_type + '' === "text_on_page";
	var retryCount = step.timeout;
	var iterationCount = 0;
	var gAutomate;

	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_ASSERTING_TEXT_ON_PAGE]));

	if (isNaN(retryCount))
		retryCount = 0;

	checkIfTextOnPage();

	function checkIfTextOnPage() {
		gAutomate = window.top.g_automate;

		if (!gAutomate)
			retryOrFailStep(messageMap[MESSAGE_KEY_FAILED_NO_G_AUTOMATE]);
		else {
			gAutomate.pageHasTextAsync(text, version).then(function(result) {
				if (result === assertOnPage) { // We got the result we were looking for
					if (assertOnPage)
						return passStep(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_ASSERT_ON_PAGE], [text]));
					else
						return passStep(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_ASSERT_NOT_ON_PAGE], [text]));
				}
				else // We didn't get the result we were looking for
					if (assertOnPage)
						retryOrFailStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_ASSERT_ON_PAGE], [text]));
					else
						retryOrFailStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_ASSERT_NOT_ON_PAGE], [text]));
			},
			function(ex) {
				var exMessage = "";
				if (typeof ex === "string")
					exMessage = ex;
				else if (ex)
					exMessage = ex.message;

				failStep(exMessage);
			});
		}
	}

	function retryOrFailStep(messageForFailure) {
		if (iterationCount < retryCount) { // Retry if we have not run out of tries
			iterationCount++;
			setTimeout(checkIfTextOnPage, 1000);
		}
		else // Out of tries
			failStep(messageForFailure);
	}
    
	function passStep(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = true;
		stepResult.message = msg;
		step.defer.resolve();
	}

	function failStep(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = false;
		stepResult.message = msg;
		step.defer.reject();
	}
	};

	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
