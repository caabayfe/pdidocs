function openTemplateDialog() {
	var dialogWindow = new GlideModal('sys_atf_add_test_template');
	dialogWindow.setTitle(new GwtMessage().getMessage('Add a test template'));
	dialogWindow.setPreference('test_id', g_form.getUniqueValue());
	dialogWindow.setWidth(500);
	dialogWindow.setPreference("focusTrap", true);
	dialogWindow.render();
}
