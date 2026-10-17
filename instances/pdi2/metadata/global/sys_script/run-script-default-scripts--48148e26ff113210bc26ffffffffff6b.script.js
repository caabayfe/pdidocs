(function executeRule(current, previous /*null when async*/) {
	var UI_TEST_SCRIPT_ID = 'bfb48f59ffdf3210f972ffffffffffb3';

	// Don't overwrite script for existing steps
	if (!current.isNewRecord())
		return;

	var isReusableTest = current.test.getRefRecord().instanceOf("sys_atf_test_callable");
	if (current.step_config == UI_TEST_SCRIPT_ID)
		current.inputs.script = new ATFVariablesUtil().getDefaultUITestScript(isReusableTest);
	else
		current.inputs.script = new ATFVariablesUtil().getDefaultServerSideScript(isReusableTest);

})(current, previous);
