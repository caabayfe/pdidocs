function enableVersionPopUp(){
	var custom_ws_definition_sys_id = g_form.getUniqueValue();
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("dialog_enable_versioning");
	dialog.setTitle(getMessage("Enable versioning"));
	dialog.setPreference('service_definition', custom_ws_definition_sys_id);
	dialog.render(); //Open the dialog
}
