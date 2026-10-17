function publish() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('publish_to_product_catalog');
	gDialog.setTitle('Publish to Hardware Catalog');
	gDialog.setPreference('sysparm_display_name', g_form.getValue('display_name'));
	gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	gDialog.setPreference('sysparm_type', 'model');
	gDialog.setPreference('sysparm_catalog', 'hardware');
	gDialog.render();
}
