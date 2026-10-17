function closeInteraction() {
	var dialog = new GlideModal("close_confirmation");
	var msg = getMessage('Confirmation');
	dialog.setTitle(msg);
	dialog.setPreference("sys_id", g_form.getUniqueValue());
	dialog.render();
}
