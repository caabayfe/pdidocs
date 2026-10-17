(function executeRule(current, previous /*null when async*/ ) {

	// ** Only runs for failed "List and Related List" steps, see filter condition **

	// All "List and Related List" steps include a "list_v3_enabled" flag in their inputs which tracks whether List v3 was enabled at the time the test started, so search the step JSON for that
	var stepJSON = JSON.parse(current.first_failing_step.test_case_json);
	if (stepJSON && stepJSON.inputs && stepJSON.inputs.list_v3_enabled)
		g_scratchpad.atf_result_annotation = gs.getMessage("atf_disable_list_v3_annotation");

})(current, previous);
