function disableCredentialLessDiscovery() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('uninstall_nmap');
	dialog.setTitle('Disable Credential-less Discovery');
	dialog.setPreference('agent_sys_id', g_form.getUniqueValue());
	dialog.setSize(400,300);
	dialog.render();
}
