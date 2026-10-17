function showLogLevelOptions() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("configure_outbound_http_log_level");
	dialog.setTitle(getMessage("HTTP Log level"));
	dialog.setPreference('sysparm_outbound_message_type', 'sys_soap_message_function');
	dialog.setPreference('sysparm_outbound_message_fn', g_form.getUniqueValue());
	dialog.setWidth(350);
	dialog.render();
}
