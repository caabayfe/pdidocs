function onLoad() {
	
	// Get sys properties table
	var sys_properties_table = new GlideRecord('sys_properties');
	
	// Get how many lanes were purchased by client
	sys_properties_table.addQuery('name', '=', 'sn_atf_tg.num_licensed_cloud_runners');
	sys_properties_table.query();
	
	while(sys_properties_table.next()){
		// If purchased lanes were greater than to two, then don't display message
		if(sys_properties_table.value > 2){
			return;
		}
	}
	
	// Get the sys id of the test suite result
	var suite_sys_id = g_form.getUniqueValue();

	// Get test result table
	var test_result_table = new GlideRecord('sys_atf_test_result');
	
	// Get the test results that were in this suite
	test_result_table.addQuery('parent', '=', suite_sys_id);
	test_result_table.query();
	
	while(test_result_table.next()){
		// If any test in suite was run on cloud
		if(test_result_table.getValue('message_reference') === "cloud") {
			var gwt = new GwtMessage();
			g_form.showFieldMsg('run_time', gwt.getMessage('ATF_TG:suggest_additional_lanes', 'info'));
			break;
		}
	}
}
