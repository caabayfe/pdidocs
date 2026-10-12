(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_atf_test_suite_test");
	gr.addQuery("test_suite", current.test_suite);
	gr.addQuery("test", current.test);
	gr.query();
	if (!gr.next())
	   return;

	var existingSysId = gr.sys_id;
	if (current.sys_id != existingSysId) {
	   current.setAbortAction(true);
	   var message = gs.getMessage("The test you are trying to add has already been added to the test suite");
	   gs.addErrorMessage(message);
	}
})(current, previous);
