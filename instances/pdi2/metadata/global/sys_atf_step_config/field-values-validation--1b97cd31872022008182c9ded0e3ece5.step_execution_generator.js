(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"ERROR: Could not read form fields; the form may not have finished loading"
	]);

	assertionObject.executeStep = function(step, stepResult) {
		new ATFFormStepExecutor(step.inputs)
			.validateFieldValues(step.timeout, step.sys_id, step.test_result_id)
			.then(onSuccess, onFail);

		function onSuccess(msg) {
			stepResult.success = true;
			stepResult.message = msg;
			stepResult.status = "success";
			step.defer.resolve();
		}

		function onFail(reason) {
			stepResult.success = false;

			// The helper rejects with an Error if an error occurs, and with a string if the form simply didn't match
			if (reason instanceof Error) {
				stepResult.status = "error";
				stepResult.message = reason.message;
			} else if (reason && reason.reason === "form_not_ready") {
				stepResult.status = "error";
				stepResult.message = messages["ERROR: Could not read form fields; the form may not have finished loading"];
			} else {
				stepResult.status = "failure";
				stepResult.message = reason;
			}

			step.defer.reject();
		}
	};

	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
