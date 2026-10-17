// Makes all tests specified in testIDs mutually exclusive with exclusiveID, which is provided by the reference picker on the modal
// testIDs should be a comma-separated list of test sys_ids
function addMutualExclusionRule(testIDs, isFromTestForm) {
	var exclusiveID = gel('test_picker').value;
	if (!exclusiveID)
		return;

	// Clear output messages to make room for any errors while inserting the mutual exclusion rule records
	GlideUI.get().clearOutputMessages();

	// Create the mutual exclusion rules
	var ga = new GlideAjax("ATFClientUtil");
	ga.addParam("sysparm_name", "addMutualExclusionRules");
	ga.addParam("sysparm_test_ids", testIDs);
	ga.addParam("sysparm_exclusive_id", exclusiveID);
	ga.addParam("sysparm_is_from_test_form", isFromTestForm);
	ga.getXMLAnswer(function(answer) {
		// Refresh the list -- support list v2 and v3 and make sure to check if listObj is defined since this can be called from multiple places
		var listObj = (typeof g_list !== 'undefined') ? g_list : GlideList.get('sys_atf_test.v_atf_mutually_exclusive_test.test');
		if (typeof listObj !== "undefined" && listObj)
			listObj.refresh();
	});

	// Clear list selection and close the modal
	GlideModal.get().fireEvent("clearSelectedItems");
	GlideModal.get().destroy();
}
