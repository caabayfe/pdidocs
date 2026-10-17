function split_item() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('pre_allocated_split');
	gDialog.setTitle(new GwtMessage().getMessage('Split {0}', g_form.getValue('display_name')));
	gDialog.setPreference('sysparm_sysID', g_form.getUniqueValue());
	gDialog.setPreference('sysparm_quantity', g_form.getIntValue('quantity'));
	assetSetDomainParameters(gDialog);
	gDialog.render();
}
