function openAddVersionPopUp() {
	var svc_def_sys_id = g_form.getUniqueValue();
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("dialog_copy_operations");
	dialog.setTitle(getMessage("Add new version"));
	dialog.setPreference('service_definition', svc_def_sys_id);
	dialog.render(); //Open the dialog
	
	// g_form.addInfoMessage('The new version has been created and is immediately available to begin serving requests.');
}
