function cancelCopy() {}

function attemptCopy() {
	var ajax = new GlideAjax('ATFClientUtil');
	ajax.addParam('sysparm_name', 'contextMenuCopyTest');
	var sysId = rowSysId;
	ajax.addParam('sysparm_sys_id', sysId);
	ajax.addParam('sysparm_check_policy', 'true');
	ajax.getXMLAnswer(function (answer) {
		if (answer == "isReadOnly")
			copyTestDialog(sysId);
		else
			GlideLists2["sys_atf_test"].refresh();
	});
}

function copyTestDialog(sysId){
	var body = getMessage("atf_demo_data_message");

	var dialog = new GlideModal('glide_modal_confirm', true, 400);
	dialog.setTitle("Attention");
	dialog.setPreference("body", body);
	dialog.setPreference("buttonLabelCancel", getMessage("Cancel"));
	dialog.setPreference("buttonLabelComplete", getMessage("Ok"));
	dialog.setPreference('onPromptCancel', cancelCopy.bind(this));
	dialog.setPreference('onPromptComplete', forceCopy.bind(this, sysId));
	dialog.render();
}

function forceCopy(sysId) {
	var ajax = new GlideAjax('ATFClientUtil');
	ajax.addParam('sysparm_name', 'contextMenuCopyTest');
	ajax.addParam('sysparm_sys_id', sysId);
	ajax.addParam('sysparm_check_policy', 'false');
	ajax.getXMLAnswer(function (answer) {
		GlideLists2["sys_atf_test"].refresh();
	});
}
