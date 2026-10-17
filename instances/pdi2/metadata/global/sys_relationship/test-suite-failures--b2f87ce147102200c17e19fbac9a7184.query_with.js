(function refineQuery(current, parent) {

	var testSuiteProcessor = new sn_atf.TestSuiteProcessor();
	var tests = testSuiteProcessor.getAllTestsForSuiteResult(parent.sys_id);

	current.addQuery("parent.base_suite_result", parent.base_suite_result);
	current.addNotNullQuery("parent.base_suite_result");
	current.addQuery("status", "failure");
	current.addQuery('test', 'IN', tests);
	// Add your code here, such as current.addQuery(field, value);

})(current, parent);
