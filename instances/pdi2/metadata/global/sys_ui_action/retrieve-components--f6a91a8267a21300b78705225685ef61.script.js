function retrieveComponentsFromStep() {
	var sessionId = g_scratchpad.session_id;
	// use an online, manual client test runner in the same session OR open a new client test runner
	// open from here instead of retrieve_components_hierarchical_progress_viewer to prevent triggering popup blockers
	var testRunnerGR = new GlideRecord("sys_atf_agent");
	testRunnerGR.addQuery("session_id", sessionId);
	testRunnerGR.addQuery("status", "online");
	testRunnerGR.addQuery("type", "manual");
	testRunnerGR.query();
	if (testRunnerGR.next())
		var testRunnerId = testRunnerGR.sys_id;

	if (typeof testRunnerId === 'undefined')
		window.open("/atf_test_runner.do?sys_atf_agent=" + sessionId + "&sysparm_nostack=true");

	var testId = g_form.getValue("test");
	var stepGR = new GlideRecord('sys_atf_step');
	stepGR.addQuery('test', testId);
	stepGR.addQuery('snapshot', '!=', 'null');
	stepGR.query();
	var testNeedsSnapshot = !stepGR.next();
	var order = g_form.getValue("order");
	var stepId = g_form.getUniqueValue();

	var dialog = new GlideModal("retrieve_components_hierarchical_progress_viewer");
	dialog.setWidth("900");
	dialog.setTitle(new GwtMessage().getMessage("Retrieve Page Components"));
	dialog.setPreference("focusTrap", true);
	dialog.setPreference("table_name", "sys_atf_step");
	dialog.setPreference("step_config_id", g_form.getValue("step_config"));
	dialog.setPreference("step_name", g_form.getDisplayValue("step_config"));
	dialog.setPreference("step_order", order);
	dialog.setPreference("test_id", testId);
	dialog.setPreference("test_needs_snapshot", testNeedsSnapshot);
	dialog.setPreference("prev_step_config_id", getPrevStepConfigId(testId, order));
	dialog.setPreference("ran_test", false);
	dialog.setPreference("is_new_step", false);
	// already checked that there is an existing client test runner or have opened a new client test runner so set checked_test_runners to true
	dialog.setPreference("checked_test_runners", true);

	// hierarchical progress viewer preferences
	dialog.setPreference('sysparm_ajax_processor', 'TestExecutorAjax');
	dialog.setPreference('sysparm_ajax_processor_ut_test_id', testId);
	dialog.setPreference('sysparm_renderer_bubble_up_messages', true);
	dialog.setPreference('sysparm_renderer_allow_shrink', true);
	dialog.setPreference('sysparm_renderer_expanded_levels', '0');
	dialog.setPreference('sysparm_delay_progress_renderer_start', false);
	dialog.setPreference('sysparm_ajax_processor_page_data_capture', true);
	dialog.setPreference('sysparm_ajax_processor_retrieve_components_step', stepId);
	dialog.setPreference('sysparm_ajax_processor_test_runner_session_id', sessionId);
	dialog.render();
}

function getPrevStepConfigId(testId, order){
	var prevStepGR = new GlideRecord("sys_atf_step");
	prevStepGR.addQuery('test', testId);
	prevStepGR.addQuery('order', order - 1);
	prevStepGR.query();
	if (prevStepGR.next())
		return prevStepGR.getValue('step_config');
}
