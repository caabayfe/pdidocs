function showFailingTestLogs() {
	// get the index of the Test Log related list tab
	var testLogTabName = "sys_atf_test_result.sys_atf_test_result_item.test_result";
	if (!g_tabs2List) {
		g_form.addInfoMessage("Load related lists before clicking 'Show failing test logs'");
		return;
	}
	var testLogTabIndex = g_tabs2List.findTabIndexByName(testLogTabName);
	if (testLogTabIndex != -1) {
		g_tabs2List.setActive(testLogTabIndex);
		// support list v2 and list v3
		var listObj = (typeof GlideList !== 'undefined') ? GlideList : GlideList2;
		listObj.get(testLogTabName).setFilterAndRefresh('status=failure');

		// set focus on the Test Log related list
		var testLogList;
		if (window.g_tabs_preference) {
			testLogList = $j("[aria-controls='sys_atf_test_result.sys_atf_test_result_item.test_result_list']");
			if (testLogList)
				testLogList.focus();
		} else {
			testLogList = $j("[data-original-title='Test Log Context Menu']");
			if (testLogList)
				testLogList.attr('tabindex', 0).focus();
		}
	}
	else
		g_form.addWarningMessage(new GwtMessage().getMessage("Test Log related list is not present on the form"));
}
