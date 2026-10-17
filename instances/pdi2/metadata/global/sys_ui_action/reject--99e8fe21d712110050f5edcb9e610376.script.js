function launchRejectDialog() {
	var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? gel('sys_uniqueValue').value : rowSysId;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('codereview_approvereject_dialog');
	var map = new GwtMessage().getMessages(["Reject"]);
	dialog.setTitle(map["Reject"]);
	dialog.setPreference('sysparm_sys_id', sysId);
	dialog.setPreference('sysparm_action', 'reject');
	dialog.setPreference('sysparm_ok_button_name', map["Reject"]);
	dialog.render();
}
