function copyTestSuiteClient() {
	var dialog = new GlideModal("hierarchical_progress_viewer", false, "40em", "10em");
	dialog.setTitle(getMessage("Copy Test Suite"));
	dialog.setPreference('sysparm_ajax_processor', 'ATFClientUtil');
	dialog.setPreference('sysparm_ajax_processor_name', 'copyTestSuite');
	dialog.setPreference('sysparm_ajax_processor_suite_id', g_form.getUniqueValue());
	dialog.setPreference("focusTrap", true);
	dialog.render();
	var goToCopyBtnDefined = false;
	dialog.on("renderStatus", function(statusObject) {
		if (statusObject == null || statusObject.result == null || goToCopyBtnDefined)
			return;

		var goToCopyBtn = new Element("button", {
			'id': 'sysparm_button_copy_page',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update("Go to Copy");

		goToCopyBtn.onclick = function() {
			var url = "";
			if (statusObject.result['copied_suite_id'])
				url += "sys_atf_test_suite.do?sys_id=" + statusObject.result['copied_suite_id'];

			window.location = url;
		};

		goToCopyBtnDefined = true;
		addButtonToProgressFooter(goToCopyBtn);
	});
}

function copyTestSuiteDialog(answer) {
	var body = getMessage("atf_copy_test_suite_dialog");

	if (answer === null || answer === "false")
		copyTestSuiteClient();
	else {
		var dialog = new GlideModal('glide_modal_confirm', true, 400);
		dialog.setTitle(getMessage("Attention"));
		dialog.setPreference("body", body);
		dialog.setPreference("buttonLabelCancel", getMessage("Cancel"));
		dialog.setPreference("buttonLabelComplete", getMessage("Ok"));
		dialog.setPreference('onPromptComplete', copyTestSuiteClient);
		dialog.render();
	}
}

function checkForReadOnlyTest() {
	var ajax = new GlideAjax('ATFClientUtil');
	ajax.addParam('sysparm_name', 'hasReadOnlyTest');
	ajax.addParam('sysparm_suite_id', g_form.getUniqueValue());
	ajax.getXMLAnswer(copyTestSuiteDialog);
}
