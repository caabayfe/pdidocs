(function executeRule(current, previous /*null when async*/ ) {
    if (current.getRecordClassName() == 'sys_atf_step_callable') {
        // callable steps have no step config
        current.display_name = gs.getMessage('Execute Test: {0}', current.callable_test.getDisplayValue());
	} else {
        current.display_name = current.step_config.name;
	}
})(current, previous);
