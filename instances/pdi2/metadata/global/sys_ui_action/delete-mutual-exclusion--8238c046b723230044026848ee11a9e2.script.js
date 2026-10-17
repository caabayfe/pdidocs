function confirmDelete() {
	// Only allow calling this from a test form
	if (typeof g_form === "undefined" || g_form.getTableName() !== "sys_atf_test")
		return;

	// Load message map
	var translator = new GwtMessage();
	var msgMap = translator.getMessages([
		"Confirmation",
		"This action will allow the selected test(s) to run in parallel with the current test. Continue?"
	]);

	var dialog = new GlideModal('glide_modal_confirm', true, 300);
	dialog.setTitle(msgMap["Confirmation"]);
	dialog.setPreference('body', msgMap["This action will allow the selected test(s) to run in parallel with the current test. Continue?"]);
	dialog.setPreference("focusTrap", true);
	dialog.setPreference('buttonClassComplete', 'btn-destructive');

	// g_list/GlideList will not be available to the modal so bind it to the function so it can be accessed
	var list = (typeof g_list !== 'undefined') ? g_list : GlideList.get('sys_atf_test.v_atf_mutually_exclusive_test.test');
	dialog.setPreference('onPromptComplete', deleteMutuallyExclusiveTest.bind(undefined, list));

	dialog.render();
}

function deleteMutuallyExclusiveTest(list) {
	// Clear UI messages
	g_form.clearMessages();

	// Get the current test ID and the ID of the virtual records whose backing mutual exclusion rules should be deleted
	var currentTestID = g_form.getUniqueValue();
	var virtualIDs = list.getChecked();

	// Make the delete call, must be done via Ajax since the delete cannot be performed in a client-side UI action
	var ga = new GlideAjax("ATFClientUtil");
	ga.addParam("sysparm_name", "deleteMutualExclusionRules");
	ga.addParam("sysparm_test_id", currentTestID);
	ga.addParam("sysparm_virtual_ids", virtualIDs);
	ga.getXMLAnswer(function(answer) {
		if (list)
			list.refresh();
	});
}
