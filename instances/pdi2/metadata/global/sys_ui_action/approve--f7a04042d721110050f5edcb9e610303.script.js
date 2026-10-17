function launchApproveDialog() {
	var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? gel('sys_uniqueValue').value : rowSysId;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('codereview_approvereject_dialog');
	var map = new GwtMessage().getMessages(["Approve"]);
	dialog.setTitle(map["Approve"]);
	dialog.setPreference('sysparm_sys_id', sysId);
	dialog.setPreference('sysparm_action', 'approve');
	dialog.setPreference('sysparm_ok_button_name', map["Approve"]);
	dialog.setPreference('focusTrap', true);
	dialog.render();
}
