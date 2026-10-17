// change display value on Test Log table from step field to summary field
var dictionaryGR = new GlideRecord("sys_dictionary");
dictionaryGR.addQuery("name", "sys_atf_test_result_item");
dictionaryGR.addQuery("element", "step");
dictionaryGR.query();
if (dictionaryGR.next()) {
	if (dictionaryGR.getValue("display") == false)
		gs.info("Display value for step field on sys_atf_test_result_item is already false");
	else {
		dictionaryGR.setValue("display", false);
		dictionaryGR.update();
		gs.info("Set display value for step field on sys_atf_test_result_item to false");
	}
}

dictionaryGR.initialize();
dictionaryGR.addQuery("name", "sys_atf_test_result_item");
dictionaryGR.addQuery("element", "summary");
dictionaryGR.query();
if (dictionaryGR.next()) {
	if (dictionaryGR.getValue("display") == true)
		gs.info("Display value for summary field on sys_atf_test_result_item is already true");
	else {
		dictionaryGR.setValue("display", true);
		dictionaryGR.update();
		gs.info("Set display value for summary field on sys_atf_test_result_item to true");
	}
}

// update failing step to reference step result instead of test log to reflect the new display value
dictionaryGR.initialize();
dictionaryGR.addQuery("name", "sys_atf_test_result");
dictionaryGR.addQuery("element", "first_failing_step");
dictionaryGR.query();
if (dictionaryGR.next()) {
	if (dictionaryGR.getValue("reference") == "sys_atf_test_result_step")
		gs.info("First failing step field already references sys_atf_test_result_step");
	else {
		dictionaryGR.setValue("reference", "sys_atf_test_result_step");
		dictionaryGR.update();
		gs.info("Set the reference for first failing step field to be sys_atf_test_result_step");
	}
}
