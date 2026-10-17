function enableCredentialLessDiscovery() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('install_nmap');
	dialog.setTitle('Enable Credential-less Discovery');
	dialog.setPreference('agent_sys_id', g_form.getUniqueValue());
	dialog.setSize(400,300);
	dialog.render();
}
