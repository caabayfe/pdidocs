	function openRemediationPopup(){
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("cmdb_run_remediations");
	dialog.setTitle(getMessage("Remediate"));
	dialog.setPreference('sysparm_task_id', gel('sys_uniqueValue').value);
	dialog.setPreference('sysparm_task_type', g_form.getTableName());
	dialog.setPreference('sysparm_task_label', g_form.getValue('number'));
	window.openedDialog = dialog;
	dialog.render();
	}
