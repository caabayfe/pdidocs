function linkSoftware() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('link_to_product_catalog');
	gDialog.setTitle('Link to Software Catalog Item');
	gDialog.setPreference('sysparm_display_name', g_form.getValue('name'));
	gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	gDialog.setPreference('sysparm_type', 'vendor');
	gDialog.setPreference('sysparm_catalog', 'software');
	gDialog.render();
}
