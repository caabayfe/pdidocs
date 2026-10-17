function addToTestSuite(testIds, testQuery) {
	var testSuiteId = gel('test_suite_picker').value;
	if (!testSuiteId)
		return;

	var gr = new GlideRecord('sys_atf_test_suite');
	gr.get(testSuiteId);
	var testSuiteName = gr.getValue('name');

	var ga = new GlideAjax('TestExecutorAjax');
	ga.addParam('sysparm_name', 'addTestsToTestSuite');
	ga.addParam('sysparm_atf_test_suite_id', testSuiteId);
	ga.addParam('sysparm_atf_test_ids', testIds);
	ga.addParam('sysparm_atf_test_query', testQuery);
	ga.getXMLAnswer(function (answer) {
		closeDialog();
		if (answer == "true") {
			addFormMessage("The selected tests were successfully added to the test suite '" + testSuiteName + "'", "info", 0);
			GlideModal.get().fireEvent("clearSelectedItems");
		} else
			addFormMessage("Unexpected error occurred while adding the selected tests to the test suite", "error", 0);

	});
}
function addFormMessage(msg, type, id) {
    GlideUI.get().clearOutputMessages();
	GlideUI.get().addOutputMessage({msg: msg, type: type, id: id});
}
function closeDialog() {
	GlideModal.get().destroy();
}
