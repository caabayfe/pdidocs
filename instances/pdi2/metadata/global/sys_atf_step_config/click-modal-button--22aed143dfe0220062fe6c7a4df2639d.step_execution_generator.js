(function (step, stepResult, assertionObject) {
	assertionObject.executeStep = function(step, stepResult) {
		new ATFFormStepExecutor(step.inputs)
			.clickModalButton(step.timeout)
			.then(handleSuccess, handleFailure);

		function handleSuccess(message) {
			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}

		function handleFailure(message) {
			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
