(function executeRule(current, previous /*null when async*/ ) {

	var LAST_EXECUTION_PREVIOUS_STEP_FAILURE = "<a href='{0}' target='_blank'>Last execution of the test</a> has failed on one of the previous steps. Fix the failing step to provide current page data for the new step";
	var LAST_EXECUTION_CURRENT_STEP_FAILURE = "<a href='{0}'>Last execution of the step</a> has failed with reason: {1}";
	
	//inspect last execution result for failure
	var grTestResult = new GlideRecord("sys_atf_test_result");
	grTestResult.addQuery("test", current.test);
	grTestResult.orderByDesc("sys_created_on");
	grTestResult.setLimit(1);
	grTestResult.query();
	if (grTestResult.next()) {
		if (isFailureStatus(grTestResult.status)) {
			if (!current.isNewRecord()) {
				var grStepResult = new GlideRecord("sys_atf_test_result_item");
				grStepResult.addQuery("test_result", grTestResult.sys_id);
				grStepResult.addQuery("step", current.sys_id);
				grStepResult.query();
				if (grStepResult.next())
					if (isFailureStatus(grStepResult.status)) {
						// escape any html in the failure reason message
						var reason = grStepResult.output.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
						gs.addErrorMessage(gs.getMessage(LAST_EXECUTION_CURRENT_STEP_FAILURE, [grTestResult.getLink(false), reason]));
					}
			} else
				  gs.addErrorMessage(gs.getMessage(LAST_EXECUTION_PREVIOUS_STEP_FAILURE, grTestResult.getLink(false)));
		}
	}

	function isFailureStatus(status) {
	  return status == "error" || status == "failure";
	}
})(current, previous);
