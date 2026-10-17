function addMutualExclusion() {
	// Only allow calling from test result form
	if (typeof g_form === "undefined" || g_form.getTableName() !== "sys_atf_test_result")
		return;

	// Clear UI messages
	g_form.clearMessages();

	// Exclusive ID is the current form
	var exclusiveResultID = g_form.getUniqueValue();

	// Get the test results of the tests to exclude
	var testResultIDs = [];

	// Support both list context (right-click) action or list choice (for checking and excluding multiple test results)
	// When the form loads rowSysId is being used by some other process to store the form sys_id which makes this action attempt to exclude the test from itself the first time it's used
	// Prevent this by making sure that rowSysId is not the current form
	if (typeof rowSysId !== "undefined" && rowSysId && rowSysId !== g_form.getUniqueValue()) {
		// Excluding a single test using the context menu
		testResultIDs.push(rowSysId);
	} else {
		// Excluding one or more tests using the list choice
		testResultIDs = g_list.getChecked();
	}

	// Make AJAX call for generating mutual exclusion rules, do not wait on the answer
	var ga = new GlideAjax("ATFClientUtil");
	ga.addParam("sysparm_name", "addMutualExclusionRulesFromTestResults");
	ga.addParam("sysparm_test_result_ids", testResultIDs);
	ga.addParam("sysparm_exclusive_result_id", exclusiveResultID);
	ga.getXMLAnswer();

	// Clear checked items -- support list v2 and v3
	if (typeof g_list !== "undefined" && g_list && g_list.onAllChecked)
		g_list.onAllChecked(false);
	else {
		var listv3 = GlideList.get('sys_atf_test_result.REL:81bdd51cdb6f2300f2410f95ca9619a1');
		if (typeof listv3 !== "undefined" && listv3 && listv3.clearChecked)
			listv3.clearChecked();
	}
}
