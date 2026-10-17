function addDefaultToColumn(element) {
	var dictionaryGR = new GlideRecord("sys_dictionary");
	dictionaryGR.addQuery("name", "sys_atf_test_suite_result");
	dictionaryGR.addQuery("element", element);
	dictionaryGR.query();

	if (!dictionaryGR.next()) {
		gs.warn("Unable to find dictionary entry for element '" + element + "'");
		return;
	}

	dictionaryGR.setValue("default_value", 0);
	if (!dictionaryGR.update()) {
		gs.warn("Unable to update dictionary entry for element '" + element + "'");
		return;
	}

	gs.info("Successfully updated dictionary entry for element '" + element + "'");
}

addDefaultToColumn("error_count");
addDefaultToColumn("failure_count");
addDefaultToColumn("skip_count");
addDefaultToColumn("success_count");
addDefaultToColumn("rolled_up_test_error_count");
addDefaultToColumn("rolled_up_test_failure_count");
addDefaultToColumn("rolled_up_test_skip_count");
addDefaultToColumn("rolled_up_test_success_count");
addDefaultToColumn("rolled_up_test_success_with_warnings_count");
addDefaultToColumn("rolled_up_test_canceled_count");
